const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const fm = require('front-matter');

const SECTIONS = [
  {
    name: 'tech',
    category: 'Technology',
    nav: '../',
    navOther1: '../../influencers/',
    navOther2: '../../blog/',
    navOther3: '../../gallery/',
    navOther4: '../../about.html',
    css: '../../assets/css/style.css',
    js: '../../assets/js/main.js',
    footerTech: '../../tech/',
    footerInfluencers: '../../influencers/',
    footerBlog: '../../blog/',
    footerGallery: '../../gallery/',
    footerAbout: '../../about.html',
    footerContact: '../../contact.html',
    footerPrivacy: '../../privacy.html',
    footerTerms: '../../terms.html',
    outputDir: 'tech/posts'
  },
  {
    name: 'blog',
    category: 'Blog',
    nav: '../',
    navOther1: '../../influencers/',
    navOther2: '../../blog/',
    navOther3: '../../gallery/',
    navOther4: '../../about.html',
    css: '../../assets/css/style.css',
    js: '../../assets/js/main.js',
    footerTech: '../../tech/',
    footerInfluencers: '../../influencers/',
    footerBlog: '../../blog/',
    footerGallery: '../../gallery/',
    footerAbout: '../../about.html',
    footerContact: '../../contact.html',
    footerPrivacy: '../../privacy.html',
    footerTerms: '../../terms.html',
    outputDir: 'blog/posts'
  },
  {
    name: 'influencers',
    category: 'Influencers',
    nav: '../',
    navOther1: '../../influencers/',
    navOther2: '../../blog/',
    navOther3: '../../gallery/',
    navOther4: '../../about.html',
    css: '../../assets/css/style.css',
    js: '../../assets/js/main.js',
    footerTech: '../../tech/',
    footerInfluencers: '../../influencers/',
    footerBlog: '../../blog/',
    footerGallery: '../../gallery/',
    footerAbout: '../../about.html',
    footerContact: '../../contact.html',
    footerPrivacy: '../../privacy.html',
    footerTerms: '../../terms.html',
    outputDir: 'influencers/posts'
  }
];

function readTemplate() {
  return fs.readFileSync(path.join(__dirname, 'templates', 'post.html'), 'utf-8');
}

function buildPost(mdFilePath, section) {
  const raw = fs.readFileSync(mdFilePath, 'utf-8');
  const parsed = fm(raw);
  const { attributes, body } = parsed;
  const slug = path.basename(mdFilePath, '.md');

  const bodyHtml = marked.parse(body);

  let template = readTemplate();
  template = template
    .replace(/__TITLE__/g, attributes.title)
    .replace(/__CATEGORY__/g, section.category)
    .replace(/__AUTHOR__/g, attributes.author || 'Copyright News')
    .replace(/__DATE__/g, attributes.date || '')
    .replace(/__READ_TIME__/g, attributes.read_time || '5 min read')
    .replace(/__EXCERPT__/g, attributes.excerpt || attributes.title)
    .replace(/__URL__/g, `${section.outputDir}/${slug}.html`)
    .replace(/__IMAGE__/g, attributes.image || '')
    .replace(/__IMAGE_ALT__/g, attributes.image_alt || attributes.title)
    .replace(/__BODY__/g, bodyHtml)
    .replace(/__CSS_PATH__/g, section.css)
    .replace(/__JS_PATH__/g, section.js)
    .replace(/__NAV_SECTION__/g, section.nav)
    .replace(/__NAV_OTHER_1__/g, section.navOther1)
    .replace(/__NAV_OTHER_2__/g, section.navOther2)
    .replace(/__NAV_OTHER_3__/g, section.navOther3)
    .replace(/__NAV_OTHER_4__/g, section.navOther4)
    .replace(/__FOOTER_TECH__/g, section.footerTech)
    .replace(/__FOOTER_INFLUENCERS__/g, section.footerInfluencers)
    .replace(/__FOOTER_BLOG__/g, section.footerBlog)
    .replace(/__FOOTER_GALLERY__/g, section.footerGallery)
    .replace(/__FOOTER_ABOUT__/g, section.footerAbout)
    .replace(/__FOOTER_CONTACT__/g, section.footerContact)
    .replace(/__FOOTER_PRIVACY__/g, section.footerPrivacy)
    .replace(/__FOOTER_TERMS__/g, section.footerTerms);

  const outDir = path.join(__dirname, section.outputDir);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, `${slug}.html`);
  fs.writeFileSync(outPath, template, 'utf-8');
  console.log(`  ✓ ${section.name}/${slug}.html`);
}

function buildAll() {
  console.log('Building posts from markdown...\n');

  let total = 0;

  SECTIONS.forEach(section => {
    const contentDir = path.join(__dirname, 'content', section.name);
    if (!fs.existsSync(contentDir)) return;

    const files = fs.readdirSync(contentDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (files.length === 0) return;

    console.log(`[${section.category}]`);
    files.forEach(file => {
      buildPost(path.join(contentDir, file), section);
      total++;
    });
    console.log();
  });

  if (total === 0) {
    console.log('No markdown posts found in content/. Create some with Decap CMS at /admin');
  } else {
    console.log(`Done! Built ${total} post(s).`);
  }
}

buildAll();
