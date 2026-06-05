/* ── Mobile Nav Toggle ── */
(function() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navLinks');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }
})();

/* ── Gallery Lightbox ── */
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
})();

/* ── Gallery Category Filter ── */
(function() {
  const filterBtns = document.querySelectorAll('.gallery-filters button');
  if (!filterBtns.length) return;

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
})();

/* ── Contact Form Handler ── */
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    const mailto = `mailto:mintdmca@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;

    window.location.href = mailto;

    if (status) {
      status.textContent = '✓ Opening your email client...';
      status.style.color = 'var(--accent)';
      status.style.display = 'block';
    }

    form.reset();
  });
})();
