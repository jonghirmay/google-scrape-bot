function extractDomain(url) {
    try {
        // Ensure the input is a valid URL string
        if (typeof url !== 'string' || url.trim() === '') {
            throw new Error('Invalid input for URL');
        }

        const urlObj = new URL(url);
        let hostname = urlObj.hostname;

        // Remove 'www.' if it exists
        hostname = hostname.replace(/^www\./, '');

        // Split the hostname to isolate the last two parts (SLD and TLD)
        const parts = hostname.split('.');
        if (parts.length > 1) {
            // Takes only the last two parts (domain and TLD)
            hostname = parts.slice(-2).join('.'); 
        }
        
        return hostname;
    } catch (error) {
        console.error('Error in extractDomain function:', error);
        return '';
    }
}

module.exports = extractDomain;
