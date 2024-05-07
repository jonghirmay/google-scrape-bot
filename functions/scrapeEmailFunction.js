


//scrape email adresses found in link
async function scrapeEmailsFromPage(page, url) {
  const emailRegex = /(?![a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(png|jpeg|svg))[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
    
    try {
       
        
        //navigation options for the pages goto
        const navigationOptions = {
            waitUntil: 'networkidle2',
            timeout: 90000 // Increased timeout
        };


        // Removes excess from path and only keeps origin domain
        function removeLastPathFromUrl(url) {
          
          const  urlObject = new URL(url);

          return urlObject.origin;
        };

        const baseUrl = removeLastPathFromUrl(url);

        // Paths to add for origin url
        const paths = ['' ,'/kontakt', '/contact', '/om'];

        let uniqueEmails = new Set();

        // Goes through url paths and scrapes emails and text content from these paths
        for (const path of paths) {
          try {
            const fullUrl = `${baseUrl}${path}`;
            await page.goto(fullUrl,navigationOptions);
            const pageContent = await page.content();
            const foundEmails = pageContent.match(emailRegex) || [];

            foundEmails.forEach(email => uniqueEmails.add(email.toLowerCase())); // Normalize and add to set
      
          } catch (error) {
            console.error(`Error scraping ${baseUrl}${path}`, error)
          }
        }

        if (uniqueEmails.size > 0) {
          return Array.from(uniqueEmails).join('; ');  // Join multiple emails separated with semicolon
        }

    }catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return '';
    }
  }

  module.exports = scrapeEmailsFromPage;
