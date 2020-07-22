const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const del = require('del');
const showdown = require('showdown');
const path = require('path');
const moment = require('moment');
const ejs = require('ejs');
const yargs = require('yargs');

const MARKDOWN_EXTENSION = '.md';

const argv = yargs
  .scriptName('mdiary')
  .option('locale', {
    alias: 'l',
    describe: 'The locale to be used for showing dates',
    default: 'en'
  })
  .option('title', {
    alias: 't',
    describe: 'The title of your diary',
    default: 'Diary'
  })
  .option('input', {
    alias: 'i',
    describe: 'The input folder containing markdown files',
    default: 'pages'
  })
  .option('output', {
    alias: 'o',
    describe: 'The output folder for the generated html',
    default: 'dist'
  })
  .argv

moment.locale(argv.locale);

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
    { page, sidebar, title: argv.title }
  );

  await fs.writeFileAsync(getRelativePath(argv.output, `${page.id}.html`), html);

  if (index === 0) {
    await fs.writeFileAsync(getRelativePath(argv.output, 'index.html'), html);
  }
}

async function getPages() {
  const pageFilePaths = await fs.readdirAsync(getRelativePath(argv.input));
  const converter = new showdown.Converter();
  
  const pages = await Promise.all(pageFilePaths
    .filter(pageFilePath => path.extname(pageFilePath) === MARKDOWN_EXTENSION)
    .map(async (pageFilePath) => {
      const rawDate = path.basename(pageFilePath, MARKDOWN_EXTENSION);
      const date = new Date(Date.parse(rawDate));
      const html = await fs.readFileAsync(getRelativePath(argv.input, pageFilePath), 'utf-8');

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
  if ((await fs.readdirAsync(process.cwd())).includes(argv.output)) {
    await del(getRelativePath(argv.output));
  }

  await fs.mkdirAsync(getRelativePath(argv.output));
}

function getRelativePath(...pathSegments) {
  return path.join(process.cwd(), ...pathSegments);
}