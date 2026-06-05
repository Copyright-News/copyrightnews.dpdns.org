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

function postCard(post, section) {
  const a = post.attributes;
  const date = a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const img = a.image || `https://picsum.photos/seed/${post.slug}/1200/675`;
  const alt = a.image_alt || a.title || '';
  const cat = a.category || 'General';

  return `<article class="post-card">
  <img class="post-card__image" src="${img}" alt="${alt}" loading="lazy" decoding="async" width="1200" height="675"/>
  <div class="post-card__content">
    <div class="post-card__meta">
      <span class="post-card__category">${cat}</span>
      ${date ? `<span>${date}</span>` : ''}
      ${a.read_time ? `<span>• ${a.read_time}</span>` : ''}
    </div>
    <h2 class="post-card__title"><a href="/${section}/${post.slug}/">${a.title || 'Untitled'}</a></h2>
    <p class="post-card__excerpt">${a.excerpt || ''}</p>
    <a href="/${section}/${post.slug}/" class="post-card__link">Read Article →</a>
  </div>
</article>`;
}

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

      return { slug, attributes: parsed.attributes };
    })
    .sort((a, b) => new Date(b.attributes.date || 0) - new Date(a.attributes.date || 0));
}

// === MAIN BUILD ===
console.log('🔨 Building Copyright News...\n');

const sections = ['tech', 'blog', 'influencers'];
const postsBySection = {};

for (const section of sections) {
  postsBySection[section] = processSection(section);
  console.log(`✅ ${postsBySection[section].length} posts in /${section}`);

  const cards = postsBySection[section].map(p => postCard(p, section)).join('\n');
  const meta = SECTION_META[section];
  const sectionHtml = render(templates.section, {
    SECTION_LABEL: meta.label,
    SECTION_DESCRIPTION: meta.description,
    SECTION_POSTS: cards || '<p>No articles published yet.</p>',
    isTech: section === 'tech' ? 'true' : '',
    isBlog: section === 'blog' ? 'true' : '',
    isInfluencers: section === 'influencers' ? 'true' : '',
  });

  const sectionOutDir = path.join(OUTPUT_DIR, section);
  fs.mkdirSync(sectionOutDir, { recursive: true });
  fs.writeFileSync(path.join(sectionOutDir, 'index.html'), sectionHtml);
}

const homepageHtml = render(templates.index, {
  TECH_POSTS: postsBySection.tech.slice(0, 6).map(p => postCard(p, 'tech')).join('\n') || '<p>No tech articles yet.</p>',
  BLOG_POSTS: postsBySection.blog.slice(0, 6).map(p => postCard(p, 'blog')).join('\n') || '<p>No blog posts yet.</p>',
  INFLUENCER_POSTS: postsBySection.influencers.slice(0, 6).map(p => postCard(p, 'influencers')).join('\n') || '<p>No influencer articles yet.</p>',
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), homepageHtml);

if (fs.existsSync(ASSETS_DIR)) {
  fs.cpSync(ASSETS_DIR, path.join(OUTPUT_DIR, 'assets'), { recursive: true });
}

// Copy admin folder to dist
const adminDir = path.join(ROOT, 'admin');
if (fs.existsSync(adminDir)) {
  fs.cpSync(adminDir, path.join(OUTPUT_DIR, 'admin'), { recursive: true });
}

// Copy gallery folder to dist
const galleryDir = path.join(ROOT, 'gallery');
if (fs.existsSync(galleryDir)) {
  fs.cpSync(galleryDir, path.join(OUTPUT_DIR, 'gallery'), { recursive: true });
}

// Copy robots.txt and sitemap.xml to dist
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

console.log('\n🎉 Build complete! Output in /dist');
