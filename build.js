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
  about: fs.readFileSync(path.join(TEMPLATES_DIR, 'about.html'), 'utf-8'),
  gallery: fs.readFileSync(path.join(TEMPLATES_DIR, 'gallery.html'), 'utf-8'),
};

const SECTION_META = {
  tech: { label: 'Tech', description: 'Deep dives into AI, web development, security, and software engineering.' },
  blog: { label: 'Blog', description: 'Opinion pieces, tutorials, and commentary on the digital landscape.' },
  influencers: { label: 'Influencers', description: 'Creator economy trends, platform policy changes, and monetization strategies.' },
};

// --- LOAD CUSTOM SETTINGS (CMS Configured) ---
const SETTINGS_DIR = path.join(CONTENT_DIR, 'settings');

let siteConfig = {
  title: "Copyright News",
  tagline: "Policy • Tech • Creators",
  hero_title: "Copyright News",
  hero_desc: "The internet’s source for visual stories and in-depth analysis on intellectual property, technology, and digital creator culture.",
  footer_text: "© 2026 Copyright News. All rights reserved."
};

let navConfig = {
  links: [
    { text: "Home", url: "/" },
    { text: "Technology", url: "/tech/" },
    { text: "Blog", url: "/blog/" },
    { text: "Influencers", url: "/influencers/" },
    { text: "Gallery", url: "/gallery/" },
    { text: "About", url: "/about/" }
  ]
};

const siteConfigPath = path.join(SETTINGS_DIR, 'site.json');
if (fs.existsSync(siteConfigPath)) {
  try {
    siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
    console.log('✓ Loaded custom site settings from content/settings/site.json');
  } catch (e) {
    console.warn('⚠ Failed to parse site.json, using defaults:', e.message);
  }
}

const navConfigPath = path.join(SETTINGS_DIR, 'navigation.json');
if (fs.existsSync(navConfigPath)) {
  try {
    navConfig = JSON.parse(fs.readFileSync(navConfigPath, 'utf-8'));
    console.log('✓ Loaded custom navigation settings from content/settings/navigation.json');
  } catch (e) {
    console.warn('⚠ Failed to parse navigation.json, using defaults:', e.message);
  }
}

// Helper: Formats logo with red span on the last word
function buildLogoHtml(title) {
  if (!title) return '';
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return title;
  const lastWord = words.pop();
  return `${words.join(' ')}<span>${lastWord}</span>`;
}

// Helper: Formats active navigation links based on current path
function buildNavLinks(currentUrl) {
  if (!navConfig.links || !Array.isArray(navConfig.links)) return '';
  return navConfig.links.map(link => {
    let isActive = false;
    if (link.url === '/') {
      isActive = currentUrl === '/' || currentUrl === '/index.html';
    } else {
      isActive = currentUrl.startsWith(link.url);
    }
    const activeClass = isActive ? ' class="active"' : '';
    return `<li><a href="${link.url}"${activeClass}>${link.text}</a></li>`;
  }).join('\n');
}

const siteVars = {
  SITE_TITLE: siteConfig.title,
  SITE_TAGLINE: siteConfig.tagline,
  SITE_TITLE_HTML: buildLogoHtml(siteConfig.title),
  HERO_TITLE: siteConfig.hero_title,
  HERO_DESC: siteConfig.hero_desc,
  FOOTER_TEXT: siteConfig.footer_text,
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

function escapeAttr(str) {
  if (!str) return '';
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function generateMasonryCard(post) {
  const a = post.attributes;
  const section = post.section || 'blog';
  const img = a.image || `https://picsum.photos/seed/${post.slug}/800/1000`;
  const date = a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const tags = a.tags ? (Array.isArray(a.tags) ? a.tags.join(',') : a.tags) : '';
  const parsedBody = marked.parse(post.body || '');

  return `
    <article class="masonry-card" 
             data-title="${escapeAttr(a.title || '')}"
             data-excerpt="${escapeAttr(a.excerpt || '')}"
             data-author="${escapeAttr(a.author || 'Copyright News')}"
             data-date="${escapeAttr(date)}"
             data-readtime="${escapeAttr(a.read_time || '5 min read')}"
             data-category="${escapeAttr(a.category || section)}"
             data-image="${escapeAttr(img)}"
             data-image-alt="${escapeAttr(a.image_alt || a.title || '')}"
             data-tags="${escapeAttr(tags)}"
             data-slug="${escapeAttr(post.slug)}"
             data-section="${escapeAttr(section)}">
      <img class="masonry-card__img" src="${img}" alt="${escapeAttr(a.image_alt || a.title || '')}" loading="lazy" />
      <div class="masonry-card-overlay">
        <div class="card-overlay-top">
          <span class="card-overlay-cat">${a.category || section}</span>
        </div>
        <div class="card-overlay-bottom">
          <div class="card-author-info">
            <div class="card-author-avatar">${(a.author || 'C')[0].toUpperCase()}</div>
            <span class="card-author-name">${a.author || 'Copyright News'}</span>
          </div>
          <button class="card-action-btn" aria-label="Read Article">👁️</button>
        </div>
      </div>
      <div class="card-content-block">
        <h3 class="card-content-title">${a.title || ''}</h3>
        <p class="card-content-excerpt">${a.excerpt || ''}</p>
      </div>
      <div class="hidden-article-body" style="display: none;">
        ${parsedBody}
      </div>
    </article>
  `;
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
        ...siteVars,
        NAV_LINKS: buildNavLinks(`/${section}/`),
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

      return { slug, attributes: parsed.attributes, section, body: parsed.body };
    })
    .sort((a, b) => new Date(b.attributes.date || 0) - new Date(a.attributes.date || 0));
}

// === MAIN BUILD EXECUTION ===
console.log('🔨 Building Copyright News (Dynamic Unsplash-style)...\n');

const todaysDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const sections = ['tech', 'blog', 'influencers'];
const postsBySection = {};

// 1. Process Markdown Files & Build Section Pages
for (const section of sections) {
  postsBySection[section] = processSection(section);
  console.log(`\n✅ ${postsBySection[section].length} posts processed in /${section}`);

  // Generate masonry grid cards for this section
  const sectionCards = postsBySection[section].length > 0 
    ? postsBySection[section].map(post => generateMasonryCard(post)).join('\n')
    : '<div class="grid-empty-state"><h3>No articles published yet</h3><p>Check back later for new visual stories in this category.</p></div>';

  const meta = SECTION_META[section];
  const sectionHtml = render(templates.section, {
    ...siteVars,
    NAV_LINKS: buildNavLinks(`/${section}/`),
    CURRENT_DATE: todaysDate,
    SECTION_LABEL: meta.label,
    SECTION_DESCRIPTION: meta.description,
    SECTION_POSTS: sectionCards,
    isTech: section === 'tech' ? 'true' : '',
    isBlog: section === 'blog' ? 'true' : '',
    isInfluencers: section === 'influencers' ? 'true' : '',
  });

  const sectionOutDir = path.join(OUTPUT_DIR, section);
  fs.mkdirSync(sectionOutDir, { recursive: true });
  fs.writeFileSync(path.join(sectionOutDir, 'index.html'), sectionHtml);
}

// 2. Build Homepage
// Combine all posts from all sections and sort by date descending
const allPosts = Object.values(postsBySection).flat()
  .sort((a, b) => new Date(b.attributes.date || 0) - new Date(a.attributes.date || 0));

console.log(`\n📦 Total articles combined: ${allPosts.length}`);

const homepageCards = allPosts.length > 0
  ? allPosts.map(post => generateMasonryCard(post)).join('\n')
  : '<div class="grid-empty-state"><h3>No articles published yet</h3><p>Subscribe or check back later to view the latest digital stories.</p></div>';

const homepageHtml = render(templates.index, {
  ...siteVars,
  NAV_LINKS: buildNavLinks('/'),
  CURRENT_DATE: todaysDate,
  ALL_ARTICLES: homepageCards,
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), homepageHtml);

// 3. Copy Assets, Admin & Static Files
if (fs.existsSync(ASSETS_DIR)) {
  fs.cpSync(ASSETS_DIR, path.join(OUTPUT_DIR, 'assets'), { recursive: true });
  console.log('✓ Copied assets/');
}

const adminDir = path.join(ROOT, 'admin');
if (fs.existsSync(adminDir)) {
  fs.cpSync(adminDir, path.join(OUTPUT_DIR, 'admin'), { recursive: true });
  console.log('✓ Copied admin/');
}

const extraFiles = ['robots.txt', 'sitemap.xml'];
for (const file of extraFiles) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUTPUT_DIR, file));
    console.log(`✓ Copied ${file}`);
  }
}

const staticPages = ['contact.html', 'privacy.html', 'terms.html', '404.html'];
for (const page of staticPages) {
  const src = path.join(ROOT, page);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUTPUT_DIR, page));
    console.log(`✓ Copied ${page}`);
  }
}

// 4. Build Dynamic About & Gallery Pages
function buildDynamicPages() {
  const settingsDir = path.join(CONTENT_DIR, 'settings');
  if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });

  // A. BUILD ABOUT PAGE
  const aboutPath = path.join(settingsDir, 'about.json');
  let aboutData = {
    title: "About Copyright News",
    subtitle: "Independent digital publication covering the intersection of technology, culture, and creativity.",
    mission_title: "Our Mission",
    mission_text: "We exist to document and analyze the landscape of technology and influencer culture.",
    story_title: "Our Story",
    story_text: "Founded in 2026, Copyright News emerged to cover tech, influencers, and the creator economy.",
    team: [],
    values: []
  };

  if (fs.existsSync(aboutPath)) {
    try {
      aboutData = JSON.parse(fs.readFileSync(aboutPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠ Failed to parse about.json, using defaults:', e.message);
    }
  }

  const teamCards = (aboutData.team || []).map(m => `
    <div class="team-card">
      <img src="${m.image}" alt="${m.name}">
      <h3>${m.name}</h3>
      <p>${m.role}</p>
    </div>
  `).join('');

  const valueCards = (aboutData.values || []).map(v => `
    <div class="value-card">
      <h3>${v.title}</h3>
      <p>${v.text}</p>
    </div>
  `).join('');

  const aboutHtml = render(templates.about, {
    ...siteVars,
    NAV_LINKS: buildNavLinks('/about/'),
    TITLE: aboutData.title,
    SUBTITLE: aboutData.subtitle,
    MISSION_TITLE: aboutData.mission_title,
    MISSION_TEXT: marked.parse(aboutData.mission_text || ''),
    STORY_TITLE: aboutData.story_title,
    STORY_TEXT: marked.parse(aboutData.story_text || ''),
    TEAM_CARDS: teamCards,
    VALUES_CARDS: valueCards
  });

  const aboutOutDir = path.join(OUTPUT_DIR, 'about');
  fs.mkdirSync(aboutOutDir, { recursive: true });
  fs.writeFileSync(path.join(aboutOutDir, 'index.html'), aboutHtml);
  console.log('✅ Built dynamic /about/');

  // B. BUILD GALLERY PAGE
  const galleryPath = path.join(settingsDir, 'gallery.json');
  let galleryData = {
    title: "Gallery",
    subtitle: "Moments captured — events, portraits, and stories in pictures",
    photos: []
  };

  if (fs.existsSync(galleryPath)) {
    try {
      galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠ Failed to parse gallery.json, using defaults:', e.message);
    }
  }

  const galleryItems = (galleryData.photos || []).map(p => `
    <div class="gallery-item">
      <img src="${p.image}" alt="${p.caption || 'Gallery'}" loading="lazy">
      ${p.caption ? `<div class="gallery-caption">${p.caption}</div>` : ''}
    </div>
  `).join('');

  const galleryHtml = render(templates.gallery, {
    ...siteVars,
    NAV_LINKS: buildNavLinks('/gallery/'),
    TITLE: galleryData.title,
    SUBTITLE: galleryData.subtitle,
    GALLERY_ITEMS: galleryItems
  });

  const galleryOutDir = path.join(OUTPUT_DIR, 'gallery');
  fs.mkdirSync(galleryOutDir, { recursive: true });
  fs.writeFileSync(path.join(galleryOutDir, 'index.html'), galleryHtml);
  console.log('✅ Built dynamic /gallery/');
}

buildDynamicPages();

console.log('\n🎉 Dynamic Unsplash-style Build complete! Output in /dist');
