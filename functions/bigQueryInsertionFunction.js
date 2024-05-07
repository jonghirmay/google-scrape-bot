const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery();

async function bigQueryInsert(data) {
    const datasetId = 'test_dataset'; 
    const tableId = 'test_table'; 

    // Reference to the dataset and table
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    // SQL queries to Big Query SQL tables
    const checkQueryIgnoreList = `SELECT link FROM \`test_dataset.ignorelist_table\` WHERE link = @link`;
    const checkQueryCompanyTableLink = `SELECT link FROM \`${datasetId}.${tableId}\` WHERE link = @link`;
    const checkQueryCompanyTableTitle = `SELECT link FROM \`${datasetId}.${tableId}\` WHERE title = @title`;
    
    try {

      const [ignoreListDuplicates] = await bigquery.query({ 
        query: checkQueryIgnoreList,
        params: {link: data.link} 
      });

      const [companyTableDuplicatesLink] = await bigquery.query({ 
        query: checkQueryCompanyTableLink,
        params: {link: data.link}
      });

      const [companyTableDuplicatesTitle] = await bigquery.query({ 
        query: checkQueryCompanyTableTitle,
        params: {title: data.title.toLowerCase().split('.')[0]}
      })

      // Data to be inserted into Big Query table
      const insertData = {
        title: data.title,
        description: data.description,
        link: data.link,
        email: data.email,  
        pageTextContent: data.pageTextContent,
        query: data.query,
        relevance: data.relevance,
        aiPredictionScore: data.aiPrediction
      }

      
        // If statement for not adding duplicates into table
        if (ignoreListDuplicates.length === 0 
          && companyTableDuplicatesLink.length === 0 
          && companyTableDuplicatesTitle.length === 0) {

            await table.insert(insertData);
            console.log(`Data from ${data.link} has been inserted into BigQuery`)
        }else {
            console.log(`Duplicate link or title was found in ignore list or company table: ${data.link}. Skipping insertion`);
        }
        
    } catch (error) {
        console.error(`Error inserting data into bigQuery, function 'bigQueryInsert': ${error} `);
    }


}

module.exports = bigQueryInsert;
