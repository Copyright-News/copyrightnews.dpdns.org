const fs = require('fs');
const path = require('path');
const matter = require('front-matter');
const marked = require('marked');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT_DIR = path.join(ROOT, 'dist');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const ASSETS_DIR = path.join(ROOT, 'assets');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read templates once at startup
const templates = {
  index: fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf-8'),
  section: fs.readFileSync(path.join(TEMPLATES_DIR, 'section.html'), 'utf-8'),
  article: fs.readFileSync(path.join(TEMPLATES_DIR, 'article.html'), 'utf-8'),
};

const SECTION_META = {
  tech: { label: 'Tech', description: 'Deep dives into AI, web development, security, and software engineering.' },
  blog: { label: 'Blog', description: 'Opinion pieces, tutorials, and commentary on the digital landscape.' },
  influencers: { label: 'Influencers', description: 'Creator economy trends, platform policy changes, and monetization strategies.' },
};

function render(template, vars) {
  let html = template;
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }
  html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, cond, content) => {
    return vars[cond] ? content : '';
  });
  return html;
}

function processSection(section) {
  const dir = path.join(CONTENT_DIR, section);
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const parsed = matter(raw);
      const slug = path.parse(file).name;

      const articleHtml = render(templates.article, {
        CURRENT_DATE: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        TITLE: parsed.attributes.title || '',
        EXCERPT: parsed.attributes.excerpt || '',
        CATEGORY: parsed.attributes.category || '',
        DATE: parsed.attributes.date ? new Date(parsed.attributes.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
        READ_TIME: parsed.attributes.read_time || '',
        AUTHOR: parsed.attributes.author || 'Copyright News',
        IMAGE: parsed.attributes.image || '',
        IMAGE_ALT: parsed.attributes.image_alt || '',
        BODY: marked.parse(parsed.body || ''),
        SECTION: section,
        SECTION_LABEL: SECTION_META[section]?.label || section,
      });

      const outDir = path.join(OUTPUT_DIR, section, slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), articleHtml);

      return { slug, attributes: parsed.attributes, section };
    })
    .sort((a, b) => new Date(b.attributes.date || 0) - new Date(a.attributes.date || 0));
}

// === HELPER FUNCTIONS FOR NEWSPAPER LAYOUT ===

// Generates the massive Hero Article HTML
function generateHero(post, section) {
  const a = post.attributes;
  const img = a.image || `https://picsum.photos/seed/${post.slug}/1200/675`;
  return `
    <article class="hero-main">
      <img class="hero-main__img" src="${img}" alt="${a.image_alt || a.title}" />
      <div class="hero-main__cat">${a.category || section}</div>
      <h1 class="hero-main__title"><a href="/${section}/${post.slug}/">${a.title}</a></h1>
      <p class="hero-main__excerpt">${a.excerpt || ''}</p>
      <div class="hero-main__meta">By ${a.author || 'Staff'} • ${a.read_time || '5 min read'}</div>
    </article>
  `;
}

// Generates the small sidebar articles
function generateSidebar(posts) {
  return posts.map(post => {
    const a = post.attributes;
    const section = post.section || 'blog';
    const img = a.image || `https://picsum.photos/seed/${post.slug}/400/300`;
    return `
      <article class="side-item">
        <img class="side-item__img" src="${img}" alt="${a.image_alt || a.title}" />
        <div>
          <div class="side-item__cat">${a.category || section}</div>
          <h3 class="side-item__title"><a href="/${section}/${post.slug}/">${a.title}</a></h3>
        </div>
      </article>
    `;
  }).join('\n');
}

// Generates the standard 3-column grid cards
function generateGrid(posts, section) {
  if (posts.length === 0) {
    return '<p>No articles published yet.</p>';
  }
  return posts.map(post => {
    const a = post.attributes;
    const img = a.image || `https://picsum.photos/seed/${post.slug}/800/600`;
    const date = a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    return `
      <article class="article-card">
        <img class="article-card__img" src="${img}" alt="${a.image_alt || a.title}" />
        <div class="article-card__cat">${a.category || section}</div>
        <h3 class="article-card__title"><a href="/${section}/${post.slug}/">${a.title}</a></h3>
        <p class="article-card__excerpt">${a.excerpt || ''}</p>
        <div class="article-card__meta">${date} • ${a.read_time || '5 min read'}</div>
      </article>
    `;
  }).join('\n');
}

// === MAIN BUILD EXECUTION ===
console.log('🔨 Building Copyright News (Editorial Layout)...\n');

const todaysDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const sections = ['tech', 'blog', 'influencers'];
const postsBySection = {};

// 1. Process Markdown Files & Build Category Pages
for (const section of sections) {
  postsBySection[section] = processSection(section);
  console.log(`✅ ${postsBySection[section].length} posts in /${section}`);

  const cards = generateGrid(postsBySection[section], section);
  const meta = SECTION_META[section];
  const sectionHtml = render(templates.section, {
    CURRENT_DATE: todaysDate,
    SECTION_LABEL: meta.label,
    SECTION_DESCRIPTION: meta.description,
    SECTION_POSTS: cards,
    isTech: section === 'tech' ? 'true' : '',
    isBlog: section === 'blog' ? 'true' : '',
    isInfluencers: section === 'influencers' ? 'true' : '',
  });

  const sectionOutDir = path.join(OUTPUT_DIR, section);
  fs.mkdirSync(sectionOutDir, { recursive: true });
  fs.writeFileSync(path.join(sectionOutDir, 'index.html'), sectionHtml);
}

// 2. Build Homepage Variables
// Combine all posts, sort by date, and pick the absolute newest for the Hero
const allPostsFlat = Object.values(postsBySection).flat()
  .sort((a, b) => new Date(b.attributes.date || 0) - new Date(a.attributes.date || 0));

const heroPost = allPostsFlat[0];
const sidebarPosts = allPostsFlat.slice(1, 4); // Next 3 newest

const homepageHtml = render(templates.index, {
  CURRENT_DATE: todaysDate,
  HERO_ARTICLE: heroPost ? generateHero(heroPost, heroPost.section || 'blog') : '<p>No articles yet.</p>',
  SIDEBAR_ARTICLES: sidebarPosts.length > 0 ? generateSidebar(sidebarPosts) : '<p>No other articles yet.</p>',
  TECH_GRID: generateGrid(postsBySection.tech.slice(0, 3), 'tech'),
  INFLUENCER_GRID: generateGrid(postsBySection.influencers.slice(0, 3), 'influencers'),
  BLOG_GRID: generateGrid(postsBySection.blog.slice(0, 3), 'blog'),
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), homepageHtml);

// 3. Copy Assets, Admin, Gallery & Static Pages
if (fs.existsSync(ASSETS_DIR)) {
  fs.cpSync(ASSETS_DIR, path.join(OUTPUT_DIR, 'assets'), { recursive: true });
}

const adminDir = path.join(ROOT, 'admin');
if (fs.existsSync(adminDir)) {
  fs.cpSync(adminDir, path.join(OUTPUT_DIR, 'admin'), { recursive: true });
}

const galleryDir = path.join(ROOT, 'gallery');
if (fs.existsSync(galleryDir)) {
  fs.cpSync(galleryDir, path.join(OUTPUT_DIR, 'gallery'), { recursive: true });
}

const extraFiles = ['robots.txt', 'sitemap.xml'];
for (const file of extraFiles) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUTPUT_DIR, file));
}

const staticPages = ['about.html', 'contact.html', 'privacy.html', 'terms.html', '404.html'];
for (const page of staticPages) {
  const src = path.join(ROOT, page);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUTPUT_DIR, page));
}

console.log('\n🎉 Editorial Build complete! Output in /dist');
