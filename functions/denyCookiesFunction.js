
// Presses 'Deny' on cookies pop-up window
async function denyCookiesButton(page) {
    await page.waitForSelector('button');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const targetButton = buttons.find(button => button.innerText.includes('Avvisa alla'));
      if (targetButton) {
        targetButton.click();
      }
    })
  }
  
  module.exports = denyCookiesButton;