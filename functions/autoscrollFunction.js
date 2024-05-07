

async function autoScroll(page) {
    await page.evaluate(async () => {
      let wrapper = document.querySelector("html");
  
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100; // smaller increment for smoother scrolling
        var scrollDelay = 1000; // initial delay
  
        var timer = setInterval(async () => {
          var scrollHeightBefore = wrapper.scrollHeight;
          wrapper.scrollBy(0, distance);
          totalHeight += distance;
  
          if (totalHeight >= scrollHeightBefore) {
            totalHeight = 0;
            await new Promise((resolve) => setTimeout(resolve, scrollDelay));
  
            // Dynamically wait for new content
            try {
              
              // Wait for a selector that indicates new content
              await page.waitForSelector('.new-article', { timeout: 5000 });

              // Adjust scrollDelay based on the content loading speed
              scrollDelay = calculateDynamicDelay(); // Implement this function based on your needs
            } catch (error) {

              // Handle the case where the selector isn't found
              console.log('No new content found, or loading took too long.');
            }
  
            // Check if new content is loaded
            var scrollHeightAfter = wrapper.scrollHeight;
  
            if (scrollHeightAfter > scrollHeightBefore) {
              return; // New content loaded, continue scrolling
            } else {
              clearInterval(timer);
              resolve(); // No more content, stop scrolling
            }
          }
        }, 100);
      });
    });
}
module.exports = autoScroll;