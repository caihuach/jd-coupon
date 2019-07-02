const axios = require('axios');
const puppeteer = require('puppeteer-core');


const url = 'https://search.jd.com/Search?coupon_batch=236566802&coupon_id=68970403689';


async function main() {
  //用特定尺寸打开浏览器，并且viewport跟随浏览器尺寸
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Users\\ch\\AppData\\Local\\CentBrowser\\Application\\chrome.exe',
    defaultViewport: null,
    args: ['--window-size=1600,900']
  });

  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});

  //todo:怎么翻页
  //while loop，按右键可以翻页，最后一页就会disabled


  //翻到最底部，触发所有的autoload
  await autoScroll(page);

  const rows = getRows4thisPage(page);

  console.dir(rows);

  // await browser.close();
}


main();


async function autoScroll(page) {
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
}

async function getRows4thisPage(page) {
  return await page.evaluate(() => {
    const lis = document.querySelectorAll('li.gl-item');
    console.log(lis.length);


    const rows = [];
    const nodeList = document.querySelectorAll('li.gl-item i[data-tips="本商品参与满减促销"]');

    //遍历所有打折商品
    for (const node of nodeList) {
      console.dir(node);
      const {
        parentNode,
        innerText
      } = node;
      const {children} = parentNode.parentNode;

      //找到有href的pName
      let pName;
      for (const child of children) {
        if (child.className.includes('p-name')) {
          pName = child;
          break;
        }
      }
      if (!pName) {
        continue;
      }
      //找到href那个元素
      let href;
      for (const child of pName.children) {
        if (child.tagName === 'A') {
          href = child.href;
          rows.push({
            href,
            name: child.innerText,
            discount: innerText
          });
          break;
        }
      }
    }


    return rows;
  });
}