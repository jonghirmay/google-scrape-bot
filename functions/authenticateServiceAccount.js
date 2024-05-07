
const {GoogleAuth} = require('google-auth-library');



async function authenticateWithServiceAccount(jsonPath) {
    // Load the service account key JSON file
    const auth = new GoogleAuth({
        keyFilename: jsonPath, // Path to your service account key file
        scopes: ['https://www.googleapis.com/auth/cloud-platform'], // Specify the scopes required
    });

    // Acquire an auth client from the GoogleAuth instance and generate an access token
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    return accessToken.token; // Return the access token
}

module.exports = authenticateWithServiceAccount;