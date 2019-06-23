const axios = require('axios');
const puppeteer = require('puppeteer-core');


const url = 'https://search.jd.com/Search?coupon_batch=233216830&coupon_id=36729135679';


async function main() {
  //用特定尺寸打开浏览器，并且viewport跟随浏览器尺寸
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Users\\lenovo\\AppData\\Local\\CentBrowser\\Application\\chrome.exe',
    defaultViewport: null,
    args: ['--window-size=1600,900']
  });

  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});

  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200)
    })
  });

  const rows = await page.evaluate(() => {
    const lis = document.querySelectorAll('li.gl-item');
    console.log(lis.length);


    const list = [];
    const items = document.querySelectorAll('li.gl-item i[data-tips="本商品参与满减促销"]');

    for (const item of items) {
      console.log(item.innerHTML);
    }


    return list;
  });


  // await browser.close();
}


main();
