const fs = require('fs');
const showdown = require('showdown');
const path = require('path');
const moment = require('moment');
const ejs = require('ejs');

const MARKDOWN_EXTENSION = '.md';

moment.locale('nl');

const pages = getPages();
const sidebar = getSidebar(pages);

Promise.all(pages.map(createPage))
  .then(() => console.log(`✅ Generated ${pages.length + 1} pages!`));

async function createPage(page, index) {
  const html = await ejs.renderFile(
    path.join(__dirname, '../templates/index.ejs'),
    { page, sidebar }
  );

  return new Promise(resolve => {
    fs.writeFile(path.join(process.cwd(), `./dist/${page.id}.html`), html, resolve);

    if (index === 0) {
      fs.writeFile(path.join(process.cwd(), `./dist/index.html`), html, resolve);
    }
  });
}

function getPages() {
  const pageFilePaths = fs.readdirSync('./pages');
  const converter = new showdown.Converter();
  
  return pageFilePaths
    .filter(pageFilePath => path.extname(pageFilePath) === MARKDOWN_EXTENSION)
    .map(pageFilePath => {
      const rawDate = path.basename(pageFilePath, MARKDOWN_EXTENSION);
      const date = new Date(Date.parse(rawDate));

      return {
        html: converter.makeHtml(fs.readFileSync(path.join('./pages', pageFilePath), 'utf-8')),
        shortDate: moment(date).format('ll'),
        fullDate: moment(date).format('LL'),
        id: rawDate,
        slug: rawDate,
        date
      }
    })
    .sort((a, b) => a.date - b.date)
    .reverse();
}

function getSidebar(pages) {
  const sectionMap = pages.reduce((sections, page) => {
    const sectionId = [page.date.getFullYear(), page.date.getMonth()].join('-');
    const pages = sections[sectionId] ? sections[sectionId].pages : [];

    return {
      ...sections,
      [sectionId]: {
        title: moment(page.date).format('MMMM YYYY'),
        pages: [...pages, page]
      }
    }
  }, {});

  return Object.keys(sectionMap)
    .map(id => ({
      ...sectionMap[id],
      id
    }))
    .sort((a, b) => a.id < b.id);
}
