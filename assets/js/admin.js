// Admin Panel JavaScript

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    // If on dashboard page, check if logged in
    if (currentPage.includes('dashboard.html')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        initDashboard();
    }
    
    // If on login page, check if already logged in
    if (currentPage.includes('login.html')) {
        if (isLoggedIn()) {
            window.location.href = 'dashboard.html';
        } else {
            initLogin();
        }
    }
});

// Login functionality
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        // Simple authentication (in production, use server-side auth)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.classList.add('show');
        }
    });
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// Logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'login.html';
}

// Dashboard initialization
function initDashboard() {
    // Setup navigation
    setupNavigation();
    
    // Load data
    loadDashboardData();
    loadArticles();
    loadGallery();
    
    // Setup forms
    setupArticleForm();
    setupImageForm();
    setupSettingsForm();
    setupEditModal();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update nav item
    const activeNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'articles': 'All Articles',
        'create-article': 'Create Article',
        'gallery': 'Gallery Management',
        'settings': 'Settings'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && titles[sectionId]) {
        pageTitle.textContent = titles[sectionId];
    }
}

// Load dashboard data
function loadDashboardData() {
    const articles = getArticles();
    const gallery = getGallery();
    
    document.getElementById('totalArticles').textContent = articles.length;
    document.getElementById('totalImages').textContent = gallery.length;
    document.getElementById('totalViews').textContent = Math.floor(Math.random() * 10000) + 5000;
    
    // Load recent articles
    const recentTable = document.getElementById('recentArticlesTable');
    if (recentTable) {
        recentTable.innerHTML = '';
        const recent = articles.slice(0, 5);
        recent.forEach(article => {
            const row = `
                <tr>
                    <td>${article.title}</td>
                    <td><span class="category-badge">${article.category}</span></td>
                    <td>${article.date}</td>
                    <td>
                        <button class="action-btn edit" onclick="editArticle('${article.id}')">Edit</button>
                        <button class="action-btn delete" onclick="deleteArticle('${article.id}')">Delete</button>
                    </td>
                </tr>
            `;
            recentTable.innerHTML += row;
        });
    }
}

// Article management
function getArticles() {
    const articles = localStorage.getItem('articles');
    return articles ? JSON.parse(articles) : [];
}

function saveArticles(articles) {
    localStorage.setItem('articles', JSON.stringify(articles));
}

function loadArticles() {
    const articles = getArticles();
    const tableBody = document.getElementById('allArticlesTable');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (articles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No articles yet. Create your first article!</td></tr>';
        return;
    }
    
    articles.forEach(article => {
        const row = `
            <tr>
                <td>${article.title}</td>
                <td>${article.category}</td>
                <td>${article.date}</td>
                <td>
                    <button class="action-btn edit" onclick="editArticle('${article.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteArticle('${article.id}')">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function setupArticleForm() {
    const form = document.getElementById('articleForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('articleTitle').value;
        const category = document.getElementById('articleCategory').value;
        const author = document.getElementById('articleAuthor').value;
        const image = document.getElementById('articleImage').value;
        const excerpt = document.getElementById('articleExcerpt').value;
        const content = document.getElementById('articleContent').value;
        
        const article = {
            id: Date.now().toString(),
            title,
            category,
            author,
            image,
            excerpt,
            content,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            views: 0
        };
        
        const articles = getArticles();
        articles.unshift(article);
        saveArticles(articles);
        
        alert('Article published successfully!');
        form.reset();
        loadArticles();
        loadDashboardData();
    });
}

function editArticle(id) {
    const articles = getArticles();
    const article = articles.find(a => a.id === id);
    
    if (!article) return;
    
    document.getElementById('editArticleId').value = article.id;
    document.getElementById('editTitle').value = article.title;
    document.getElementById('editCategory').value = article.category;
    document.getElementById('editImage').value = article.image;
    document.getElementById('editExcerpt').value = article.excerpt;
    document.getElementById('editContent').value = article.content;
    
    document.getElementById('editModal').classList.add('show');
}

function setupEditModal() {
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modal.classList.remove('show');
        });
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    const editForm = document.getElementById('editArticleForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('editArticleId').value;
            const articles = getArticles();
            const index = articles.findIndex(a => a.id === id);
            
            if (index === -1) return;
            
            articles[index].title = document.getElementById('editTitle').value;
            articles[index].category = document.getElementById('editCategory').value;
            articles[index].image = document.getElementById('editImage').value;
            articles[index].excerpt = document.getElementById('editExcerpt').value;
            articles[index].content = document.getElementById('editContent').value;
            
            saveArticles(articles);
            
            modal.classList.remove('show');
            loadArticles();
            loadDashboardData();
            
            alert('Article updated successfully!');
        });
    }
}

function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    const articles = getArticles();
    const filtered = articles.filter(a => a.id !== id);
    saveArticles(filtered);
    
    loadArticles();
    loadDashboardData();
}

// Gallery management
function getGallery() {
    const gallery = localStorage.getItem('gallery');
    return gallery ? JSON.parse(gallery) : [];
}

function saveGallery(gallery) {
    localStorage.setItem('gallery', JSON.stringify(gallery));
}

function loadGallery() {
    const gallery = getGallery();
    const grid = document.getElementById('adminGalleryGrid');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (gallery.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--admin-text-light);">No images in gallery. Add your first image!</p>';
        return;
    }
    
    gallery.forEach(item => {
        const div = `
            <div class="gallery-item">
                <img src="${item.url}" alt="${item.caption}">
                <div class="gallery-overlay">${item.caption}</div>
                <div class="gallery-actions">
                    <button class="edit-btn" onclick="alert('Edit feature coming soon!')"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteImage('${item.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        grid.innerHTML += div;
    });
    
    document.getElementById('totalImages').textContent = gallery.length;
}

function setupImageForm() {
    const addBtn = document.getElementById('addImageBtn');
    const imageForm = document.getElementById('imageForm');
    const cancelBtn = document.getElementById('cancelImageBtn');
    
    if (!addBtn || !imageForm) return;
    
    addBtn.addEventListener('click', function() {
        imageForm.style.display = 'block';
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            imageForm.style.display = 'none';
            imageForm.reset();
        });
    }
    
    imageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const url = document.getElementById('imageUrl').value;
        const caption = document.getElementById('imageCaption').value;
        const category = document.getElementById('imageCategory').value;
        
        const item = {
            id: Date.now().toString(),
            url,
            caption,
            category
        };
        
        const gallery = getGallery();
        gallery.unshift(item);
        saveGallery(gallery);
        
        imageForm.reset();
        imageForm.style.display = 'none';
        loadGallery();
        
        alert('Image added successfully!');
    });
}

function deleteImage(id) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    const gallery = getGallery();
    const filtered = gallery.filter(item => item.id !== id);
    saveGallery(filtered);
    
    loadGallery();
    loadDashboardData();
}

// Settings
function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const siteTitle = document.getElementById('siteTitle').value;
        const siteDescription = document.getElementById('siteDescription').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Save site settings
        localStorage.setItem('siteTitle', siteTitle);
        localStorage.setItem('siteDescription', siteDescription);
        
        // Handle password change
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            localStorage.setItem('adminPassword', newPassword);
            alert('Settings and password saved successfully!');
        } else {
            alert('Settings saved successfully!');
        }
        
        form.reset();
        document.getElementById('siteTitle').value = siteTitle;
        document.getElementById('siteDescription').value = siteDescription;
    });
}

// Mobile menu
function setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.admin-sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !mobileBtn?.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
}

// Global functions for inline onclick handlers
window.showSection = showSection;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.deleteImage = deleteImage;
