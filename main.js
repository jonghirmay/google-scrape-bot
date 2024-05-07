const puppeteer = require('puppeteer-extra');
const StealthPlugIn = require('puppeteer-extra-plugin-stealth');
const predictRelevance = require('./functions/aiPredictRelevanceFunction');
const authenticateWithServiceAccount = require('./functions/authenticateServiceAccount')
const bigQueryInsert = require('./functions/bigQueryInsertionFunction');
const autoScroll = require('./functions/autoscrollFunction');
const denyCookiesButton = require('./functions/denyCookiesFunction');
const scrapeEmailsFromPage = require('./functions/scrapeEmailFunction');
const extractDomain = require('./functions/extractDomainFunction')

require('dotenv').config();
// Access to credentials from authorizing json file(for service account)
GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;

// Credentials for GCP Vertex AI
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION;
const ENDPOINT_ID = process.env.ENDPOINT_ID;


puppeteer.use(StealthPlugIn());

async function getCredentialsToken() {
  accessToken = await authenticateWithServiceAccount(GOOGLE_APPLICATION_CREDENTIALS);
  return accessToken;
};

const accessCredentialsToken = getCredentialsToken()




// Function scrolls through pages of search 
async function scrapeAllresults(query) {


  try {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        
    });
    const page = await browser.newPage();

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    
    await denyCookiesButton(page)

    await autoScroll(page);

    await page.evaluate(() => {
      function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
      }

      // Clicks the button for more results
      function clickMoreResults() {
        const h3Elements = document.querySelectorAll("h3");

        for (const h3 of h3Elements) {
          if (h3.textContent.includes("Fler resultat")) { // 'Fler resultat'(swedish) = 'More results'(english)
            h3.click();
            return true; // If true 'Fler resultat' was clicked
          }
        }

        return false; // 'Fler resultat' not found
      }

      // Function to repeatedly click and scroll
      function loadMoreResults() {
        const interval = setInterval(() => {
          const clicked = clickMoreResults();
          if (clicked) {
            scrollToBottom();
          } else {
            clearInterval(interval); // Stop the loop if no more "More results" are found
          }
        }, 1000); // Adjust the interval as needed
      }

      loadMoreResults();
    });

    await page.waitForTimeout(60000);
    

    // Scrape search refering to css elements from html for wanted values
    const scrapedData = await page.$$eval('.tF2Cxc', elements => elements.map(element => {
      const title = element.querySelector('.VuuXrf')?.textContent || '';
      const description = element.querySelector('.VwiC3b')?.textContent || '';
      const link = element.querySelector('a')?.href || '';
      return { title, description, link };
    }));

    // Removes duplicates
    const filteredScrapedData = [...new Map(scrapedData.map(item => [item.link, item])).values()];


    // loop each link and scrape email adresses from each link
    for (const data of filteredScrapedData) {
      try {
        await page.goto(data.link, { waitUntil: 'networkidle2' });
        data.pageTextContent = await page.evaluate(() => document.body.innerText);

        data.email = await scrapeEmailsFromPage(page, data.link);
        data.query = query;

      } catch (error) {
        console.error(`Error: ${error}`);
        
      }
      
    }
  
    for (const data of filteredScrapedData) {

      try {
        // Takes away '.se', '.com' from title and makes the title lower case
        data.title = data.title.toLowerCase().split('.')[0];

        // Data for the AI to predict
        const instanceData = [{
          title: data.title || "",
          description: data.description || "",
          pageTextContent: data.pageTextContent || "",
          query: data.query || "",
        }];


        data.aiPrediction = await predictRelevance(PROJECT_ID ,LOCATION, ENDPOINT_ID, await accessCredentialsToken, instanceData[0]);

        const relevanceThreshold = 0.5;

        data.relevance = data.aiPrediction >= relevanceThreshold ? 1 : 0;

        data.link = extractDomain(data.link);

       
        if(data.link.includes('nu')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('se')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('com')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('co')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('io')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('net')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('digital')) {
          await bigQueryInsert(data);

        }else if(data.link.includes('agency')) {
          await bigQueryInsert(data);

        }else {
          console.error('Unwanted domain', data.link)
        }
     
      } catch (error) {
        console.error(`Error running bigQueryInsert function: ${error}`)
        
      }
    }
    
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }

}

const defaultTimeout = 60000; // 60 seconds

(async () => {  
    
  // Search query 
    const queries = [
      'wordpress agency',
      'marketing agency'
  ];

    for (const query of queries) {
        const results = await scrapeAllresults(query);
        
    } 
})();
