/* ── Mobile Navigation Toggle ── */
(function() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('headerNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      nav.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }
})();

/* ── Unsplash-Style Masonry Grid Filters & Search ── */
(function() {
  const heroSearch = document.getElementById('heroSearchInput');
  const headerSearch = document.getElementById('headerSearchInput');
  const masonryGrid = document.getElementById('masonryGrid');
  const categoryLinks = document.querySelectorAll('#categoryScroll a');

  if (!masonryGrid) return; // Only run on pages that have the masonry grid

  const cards = Array.from(masonryGrid.querySelectorAll('.masonry-card'));
  let currentCategory = 'all';
  let searchQuery = '';

  // Setup empty state element dynamically if not present
  let emptyState = masonryGrid.querySelector('.grid-empty-state');
  if (!emptyState) {
    emptyState = document.createElement('div');
    emptyState.className = 'grid-empty-state';
    emptyState.style.display = 'none';
    emptyState.innerHTML = '<h3>No articles found</h3><p>Try refining your search keywords or choosing a different category.</p>';
    masonryGrid.appendChild(emptyState);
  }

  function filterGrid() {
    let visibleCount = 0;

    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const excerpt = (card.dataset.excerpt || '').toLowerCase();
      const author = (card.dataset.author || '').toLowerCase();
      const category = (card.dataset.category || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();

      // Check category match
      const matchesCategory = currentCategory === 'all' || category === currentCategory.toLowerCase();

      // Check search query match (fuzzy check across fields)
      const matchesSearch = !searchQuery || 
        title.includes(searchQuery) ||
        excerpt.includes(searchQuery) ||
        author.includes(searchQuery) ||
        category.includes(searchQuery) ||
        tags.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle empty state
    if (visibleCount === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }
  }

  // Synchronize inputs
  function handleSearchInput(e) {
    searchQuery = e.target.value.toLowerCase().trim();
    if (heroSearch && e.target !== heroSearch) heroSearch.value = e.target.value;
    if (headerSearch && e.target !== headerSearch) headerSearch.value = e.target.value;
    filterGrid();
  }

  if (heroSearch) heroSearch.addEventListener('input', handleSearchInput);
  if (headerSearch) headerSearch.addEventListener('input', handleSearchInput);

  // Category Selector
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const cat = this.dataset.category;
      if (!cat) return; // Allow normal navigation if no data-category

      e.preventDefault();

      // Update active state
      categoryLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      currentCategory = cat;
      filterGrid();

      // Scroll category element into view smoothly inside horizontal scroll bar
      this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
})();

/* ── Unsplash-Style Interactive Detail Modal ── */
(function() {
  const overlay = document.getElementById('articleModalOverlay');
  const modal = document.getElementById('articleModal');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!overlay || !modal) return;

  const avatar = document.getElementById('modalAvatar');
  const authorName = document.getElementById('modalAuthor');
  const pubDate = document.getElementById('modalDate');
  const shareBtn = document.getElementById('modalShareBtn');
  const viewPageBtn = document.getElementById('modalViewPageBtn');
  const heroImg = document.getElementById('modalHeroImg');
  const title = document.getElementById('modalTitle');
  const prose = document.getElementById('modalProse');
  const tagsList = document.getElementById('modalTagsList');

  let activeArticleUrl = '';

  function openModal(card) {
    const d = card.dataset;
    const bodyContentEl = card.querySelector('.hidden-article-body');

    // Populate metadata
    authorName.textContent = d.author || 'Copyright News Staff';
    pubDate.textContent = `${d.date || ''} • ${d.readtime || '5 min read'}`;
    title.textContent = d.title || '';
    
    // Avatar first letter
    const initial = (d.author || 'C')[0].toUpperCase();
    avatar.textContent = initial;

    // View full page link
    const pageUrl = `/${d.section}/${d.slug}/`;
    viewPageBtn.href = pageUrl;
    activeArticleUrl = window.location.origin + pageUrl;

    // Image
    if (d.image) {
      heroImg.src = d.image;
      heroImg.alt = d.imageAlt || d.title || '';
      heroImg.parentElement.style.display = 'block';
    } else {
      heroImg.parentElement.style.display = 'none';
    }

    // Body content (prose HTML)
    if (bodyContentEl) {
      prose.innerHTML = bodyContentEl.innerHTML;
    } else {
      prose.innerHTML = `<p>${d.excerpt || ''}</p>`;
    }

    // Related tags
    tagsList.innerHTML = '';
    const tags = d.tags ? d.tags.split(',') : [];
    if (tags.length > 0) {
      tags.forEach(tag => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        const tagEl = document.createElement('span');
        tagEl.className = 'modal-tag-item';
        tagEl.textContent = cleanTag;
        tagsList.appendChild(tagEl);
      });
      tagsList.parentElement.style.display = 'block';
    } else {
      tagsList.parentElement.style.display = 'none';
    }

    // Reset share button text
    shareBtn.textContent = 'Copy Link';

    // Show modal
    overlay.classList.add('active');
    document.body.classList.add('modal-open');

    // Reset scroll of modal body
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  // Setup click triggers on cards
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.masonry-card');
    if (!card) return;

    // Ignore clicks on anchor links inside overlay
    if (e.target.closest('a') || e.target.closest('.card-action-btn')) {
      return;
    }

    e.preventDefault();
    openModal(card);
  });

  // Modal actions (Close)
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Share copy functionality
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      if (!activeArticleUrl) return;
      navigator.clipboard.writeText(activeArticleUrl).then(() => {
        shareBtn.textContent = '✓ Copied!';
        setTimeout(() => {
          shareBtn.textContent = 'Copy Link';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  }
})();

/* ── Photo Gallery Lightbox (Legacy / Gallery Page Support) ── */
(function() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (!lightbox) return;

  let currentIndex = 0;
  let galleryItems = [];

  function getGalleryImages() {
    if (document.getElementById('galleryGrid')) {
      const items = document.querySelectorAll('#galleryGrid .gallery-item img');
      galleryItems = Array.from(items);
    }
  }

  function openLightbox(index) {
    getGalleryImages();
    if (galleryItems.length === 0) return;
    currentIndex = index;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxImg.alt = galleryItems[currentIndex].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxImg.alt = galleryItems[currentIndex].alt;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].src;
    lightboxImg.alt = galleryItems[currentIndex].alt;
  }

  if (document.getElementById('galleryGrid')) {
    document.getElementById('galleryGrid').addEventListener('click', function(e) {
      const img = e.target.closest('img');
      if (!img) return;
      const allImgs = document.querySelectorAll('#galleryGrid .gallery-item img');
      const idx = Array.from(allImgs).indexOf(img);
      if (idx !== -1) openLightbox(idx);
    });
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Gallery Filters
  const filterBtns = document.querySelectorAll('.gallery-filters button');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.dataset.filter;
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
})();
