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

function parsePostDate(dateStr) {
  if (!dateStr) return new Date(0);
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return new Date(parsed);
  return new Date(0);
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

  return {
    title: attributes.title,
    author: attributes.author || 'Copyright News',
    date: attributes.date || '',
    dateObj: parsePostDate(attributes.date),
    read_time: attributes.read_time || '5 min read',
    excerpt: attributes.excerpt && attributes.excerpt.trim() ? attributes.excerpt : attributes.title,
    image: attributes.image || '',
    image_alt: attributes.image_alt || attributes.title,
    slug: slug,
    category: section.category,
    section: section.name,
    url: `${section.name}/posts/${slug}.html`
  };
}

function replaceBlock(content, startAnchor, endAnchor, replacement) {
  const startIdx = content.indexOf(startAnchor);
  const endIdx = content.indexOf(endAnchor);
  if (startIdx === -1 || endIdx === -1) {
    console.warn(`Warning: Anchor ${startAnchor} or ${endAnchor} not found.`);
    return content;
  }
  const before = content.substring(0, startIdx + startAnchor.length);
  const after = content.substring(endIdx);
  return before + '\n' + replacement + '\n' + after;
}

function generateCategoryGridHtml(categoryPosts, categoryLabel) {
  const limitPosts = categoryPosts.slice(0, 3);
  if (limitPosts.length === 0) {
    return `          <div class="no-articles-placeholder" style="grid-column: 1 / -1; text-align: center; color: #a0a0a5; padding: 3rem 1rem; border: 1px dashed #333; border-radius: 8px; width: 100%;">
            <p style="margin: 0; font-size: 1rem;">No articles published in this category yet. Check back soon!</p>
          </div>`;
  }
  return limitPosts.map(post => {
    const imgUrl = post.image || `https://picsum.photos/seed/${post.slug}-cat/400/250`;
    return `          <a href="${post.url}" class="article-card">
            <img src="${imgUrl}" alt="${post.image_alt}" loading="lazy">
            <div class="article-card-body">
              <span class="category">${post.category}</span>
              <h3>${post.title}</h3>
              <p>${post.excerpt}</p>
              <span class="meta">${post.date} • ${post.read_time}</span>
            </div>
          </a>`;
  }).join('\n');
}

function updateHomepage(allPosts) {
  const filePath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn('Warning: index.html not found.');
    return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Breaking News
  let breakingNewsHtml = '';
  if (allPosts.length > 0) {
    const post = allPosts[0];
    breakingNewsHtml = `      <span class="breaking-text"><a href="${post.url}">${post.title} — read more →</a></span>`;
  } else {
    breakingNewsHtml = `      <span class="breaking-text">No breaking news at this time.</span>`;
  }
  content = replaceBlock(content, '<!-- BREAKING_NEWS_START -->', '<!-- BREAKING_NEWS_END -->', breakingNewsHtml);

  // 2. Hero Main
  let heroMainHtml = '';
  if (allPosts.length > 0) {
    const post = allPosts[0];
    const imgUrl = post.image || `https://picsum.photos/seed/${post.slug}-hero/800/450`;
    heroMainHtml = `          <a href="${post.url}" class="hero-main">
            <img src="${imgUrl}" alt="${post.image_alt}" loading="lazy">
            <div class="hero-content">
              <span class="hero-category">${post.category}</span>
              <h2>${post.title}</h2>
              <p class="hero-meta">By ${post.author} • ${post.date} • ${post.read_time}</p>
            </div>
          </a>`;
  } else {
    heroMainHtml = `          <div class="hero-main placeholder-card" style="display:flex; align-items:center; justify-content:center; background:#1e1e24; color:#a0a0a5; text-align:center; padding: 2rem; border-radius: 8px; min-height: 350px;">
            <div>
              <h3>Welcome to Copyright News</h3>
              <p>Articles published via Sveltia CMS will appear here in real-time.</p>
            </div>
          </div>`;
  }
  content = replaceBlock(content, '<!-- HERO_MAIN_START -->', '<!-- HERO_MAIN_END -->', heroMainHtml);

  // 3. Hero Side
  let heroSideHtml = '';
  const sidePosts = allPosts.slice(1, 4);
  if (sidePosts.length > 0) {
    heroSideHtml = sidePosts.map(post => {
      const imgUrl = post.image || `https://picsum.photos/seed/${post.slug}/120/90`;
      return `            <a href="${post.url}" class="hero-side-item">
              <img src="${imgUrl}" alt="${post.image_alt}" loading="lazy">
              <div>
                <h3>${post.title}</h3>
                <span class="date">${post.date}</span>
              </div>
            </a>`;
    }).join('\n');
  } else {
    heroSideHtml = `            <div class="hero-side-placeholder" style="color: #a0a0a5; padding: 1rem; border: 1px dashed #333; border-radius: 6px; text-align: center; width: 100%;">
              <p style="margin: 0; font-size: 0.9rem;">Additional articles will appear here as they are published.</p>
            </div>`;
  }
  content = replaceBlock(content, '<!-- HERO_SIDE_START -->', '<!-- HERO_SIDE_END -->', heroSideHtml);

  // 4. Tech Grid
  const techPosts = allPosts.filter(p => p.section === 'tech');
  content = replaceBlock(content, '<!-- TECH_GRID_START -->', '<!-- TECH_GRID_END -->', generateCategoryGridHtml(techPosts, 'Tech'));

  // 5. Influencers Grid
  const influencersPosts = allPosts.filter(p => p.section === 'influencers');
  content = replaceBlock(content, '<!-- INFLUENCERS_GRID_START -->', '<!-- INFLUENCERS_GRID_END -->', generateCategoryGridHtml(influencersPosts, 'Influencers'));

  // 6. Blog Grid
  const blogPosts = allPosts.filter(p => p.section === 'blog');
  content = replaceBlock(content, '<!-- BLOG_GRID_START -->', '<!-- BLOG_GRID_END -->', generateCategoryGridHtml(blogPosts, 'Blog'));

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('  ✓ Updated index.html');
}

function updateCategoryListing(section, sectionPosts) {
  const filePath = path.join(__dirname, section.name, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: Category page ${filePath} not found.`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');

  let listingHtml = '';
  if (sectionPosts.length > 0) {
    listingHtml = sectionPosts.map(post => {
      const imgUrl = post.image || `https://picsum.photos/seed/${post.slug}-listing/400/250`;
      return `          <a href="posts/${post.slug}.html" class="listing-card">
            <img src="${imgUrl}" alt="${post.image_alt}" loading="lazy">
            <div class="listing-card-body">
              <div class="date">${post.date}</div>
              <h2>${post.title}</h2>
              <p>${post.excerpt}</p>
            </div>
          </a>`;
    }).join('\n');
  } else {
    listingHtml = `          <div class="no-articles-placeholder" style="grid-column: 1 / -1; text-align: center; color: #a0a0a5; padding: 5rem 1rem; border: 1px dashed #333; border-radius: 8px; width: 100%;">
            <p style="margin: 0; font-size: 1.1rem;">No articles published in this category yet. Check back soon!</p>
          </div>`;
  }

  content = replaceBlock(content, '<!-- LISTING_GRID_START -->', '<!-- LISTING_GRID_END -->', listingHtml);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  ✓ Updated ${section.name}/index.html`);
}

function buildAll() {
  console.log('Building posts from markdown...\n');

  const allPosts = [];

  SECTIONS.forEach(section => {
    const contentDir = path.join(__dirname, 'content', section.name);
    if (!fs.existsSync(contentDir)) return;

    const files = fs.readdirSync(contentDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (files.length === 0) {
      // Still update listing for empty category
      updateCategoryListing(section, []);
      return;
    }

    console.log(`[${section.category}]`);
    const sectionPosts = [];
    files.forEach(file => {
      const post = buildPost(path.join(contentDir, file), section);
      allPosts.push(post);
      sectionPosts.push(post);
    });
    console.log();

    // Sort section posts by date descending
    sectionPosts.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    updateCategoryListing(section, sectionPosts);
  });

  // Sort all posts globally by date descending
  allPosts.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  // Update homepage sections
  updateHomepage(allPosts);

  if (allPosts.length === 0) {
    console.log('No markdown posts found in content/. Create some with Sveltia CMS at /admin');
  } else {
    console.log(`Done! Built ${allPosts.length} post(s).`);
  }
}

buildAll();
