const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const del = require('del');
const showdown = require('showdown');
const path = require('path');
const moment = require('moment');
const ejs = require('ejs');

const MARKDOWN_EXTENSION = '.md';
const OUTPUT_DIR = 'dist';
const INPUT_DIR = 'pages';

moment.locale('nl');

run();

async function run() {
  const pages = await getPages();
  const sidebar = getSidebar(pages);
  
  await prepareOutputDir();
  await Promise.all(pages.map((page, index) => createPage(page, index, sidebar)));
  
  console.log(`✅ Generated ${pages.length + 1} pages!`);
}

async function createPage(page, index, sidebar) {
  const html = await ejs.renderFile(
    path.join(__dirname, '../templates/index.ejs'),
    { page, sidebar }
  );

  await fs.writeFileAsync(getRelativePath(OUTPUT_DIR, `${page.id}.html`), html);

  if (index === 0) {
    await fs.writeFileAsync(getRelativePath(OUTPUT_DIR, 'index.html'), html);
  }
}

async function getPages() {
  const pageFilePaths = await fs.readdirAsync(getRelativePath(INPUT_DIR));
  const converter = new showdown.Converter();
  
  const pages = await Promise.all(pageFilePaths
    .filter(pageFilePath => path.extname(pageFilePath) === MARKDOWN_EXTENSION)
    .map(async (pageFilePath) => {
      const rawDate = path.basename(pageFilePath, MARKDOWN_EXTENSION);
      const date = new Date(Date.parse(rawDate));
      const html = await fs.readFileAsync(getRelativePath(INPUT_DIR, pageFilePath), 'utf-8');

      return {
        html: converter.makeHtml(html),
        shortDate: moment(date).format('ll'),
        fullDate: moment(date).format('LL'),
        id: rawDate,
        slug: rawDate,
        date
      }
    }));
  
    return pages
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

async function prepareOutputDir() {
  if ((await fs.readdirAsync(process.cwd())).includes(OUTPUT_DIR)) {
    await del(getRelativePath(OUTPUT_DIR));
  }

  await fs.mkdirAsync(getRelativePath(OUTPUT_DIR));
}

function getRelativePath(...pathSegments) {
  return path.join(process.cwd(), ...pathSegments);
}