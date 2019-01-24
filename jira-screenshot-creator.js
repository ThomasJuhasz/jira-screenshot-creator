const puppeteer = require('puppeteer');
const fs = require('fs');

const fileName = 'links.txt';
var targetDir = './screenshots';
const optivaInfo = {
  url: '',
  username: '',
  password: '',
}
const trilogyInfo = {
  url: '',
  username: '',
  password: '',
}

var lines = require('fs').readFileSync(fileName, 'utf-8')
    .split('\n')
    .filter(Boolean);

if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir);
}

puppeteer.launch({headless: true}).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await login(page, optivaInfo);
  await login(page, trilogyInfo);

  for (const line of lines) {
    await page.goto(line);
    const lineWithoutLineBreak = line.replace(/(\r\n|\n|\r)/gm, "");
    const taskID = lineWithoutLineBreak.match('[A-Z-].*$');    
    await page.screenshot({ path: `${targetDir}/${taskID}.png`, fullPage: true });
    console.log(`created screenshot of: ${taskID}`);
  }
  
  await browser.close();
});

async function login(page, info) {
  console.log(`going to ${info.url}`);
  await page.goto(info.url);
  await page.type('#login-form-username', info.username);
  await page.type('#login-form-password', info.password);
  await Promise.all([
      page.click('#login-form-submit'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  console.log(`logged in to ${info.url}`);
}