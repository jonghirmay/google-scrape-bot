const axios = require('axios');

async function predictRelevance(project, location, endpoint, accessToken, instance) {

    // URL path for Vertex AI
    const vertexUrl = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${location}/endpoints/${endpoint}:predict`;

    try {
      const response = await axios.post(vertexUrl, {
        instances: [instance]
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Sets variable for the predictionscore from the AI prediction
      const predictionScore = response.data.predictions[0].scores[0];

      console.log('Prediction response:', predictionScore);
      return predictionScore; // Returns prediction score

    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to predict relevance.');
      
    }
  }


  module.exports = predictRelevance;

