const puppeteer = require('puppeteer-core');

const discountObj = {};
let discountArr = [];

const url = 'https://search.jd.com/Search?coupon_batch=239432678&coupon_id=37426841159';

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

function getRows4thisPage(page) {
  return page.evaluate(() => {
    const lis = document.querySelectorAll('li.gl-item');
    console.log(lis.length);


    const rows = [];
    const nodeList = document.querySelectorAll('li.gl-item i[data-tips="本商品参与满减促销"]');

    //遍历所有打折商品
    for (const node of nodeList) {
      console.dir(node);
      const {
        parentNode,
        innerText: discountName
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
            discountName,
          });
          break;
        }
      }
    }

    return rows;
  });
}

function nextPageDisabled(page) {
  return page.evaluate(() => {
    const next = document.querySelector('.pn-next');
    if (!next) {
      return true;
    }
    return next.className.includes('disabled');
  })
}

function convertArr(discountArr) {
  for (const discount of discountArr) {
    const {
      href,
      name,
      discountName
    } = discount;

    if (!Array.isArray(discountObj[discountName])) {
      discountObj[discountName] = [];
    }
    discountObj[discountName].push({
      href,
      name,
    });
  }
}

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

  while (true) {
    //1. 翻到最底部，触发所有的autoload
    await autoScroll(page);
    //2. 看看有没有打折的
    const rows = await getRows4thisPage(page);

    //3. 存起来这些rows
    discountArr = discountArr.concat(rows);

    //4. 看看下一页还有没有了
    const shouldBreak = await nextPageDisabled(page);

    console.log(shouldBreak);
    if (shouldBreak) {
      break;
    }
    //5. 翻页
    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle2'}),
      page.keyboard.press('ArrowRight'),
    ])
  }


  convertArr(discountArr);
  console.dir(discountObj);


  // await browser.close();
}


main();
