// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Metra Innovations - Website Loaded');

    initNavbar();
    initSmoothScroll();
    initCounterAnimation();
    initPortfolioFilter();
    initFormValidation();
    initAnimations();
    initSocialSharing();
});

// ==================== NAVBAR ====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    // Cache section positions to avoid forced reflow on scroll
    let sectionPositions = [];
    let lastReflowTime = 0;
    const REFLOW_THROTTLE = 250; // ms

    // Initialize section positions - use requestAnimationFrame to avoid forced reflow
    const updateSectionPositions = () => {
        // Schedule position calculation for next frame (avoids layout thrashing)
        window.requestAnimationFrame(() => {
            const sections = document.querySelectorAll('section[id]');
            sectionPositions = Array.from(sections).map(section => ({
                id: section.getAttribute('id'),
                top: section.offsetTop - 100,
                height: section.offsetHeight,
                navLink: document.querySelector(`.nav-link[href="#${section.getAttribute('id')}"]`)
            }));
        });
    };

    // Update positions on resize and load (not on scroll)
    // Use debounce to prevent multiple reflows during rapid resize
    const debouncedUpdate = debounce(updateSectionPositions, 250);
    window.addEventListener('resize', debouncedUpdate, { passive: true });
    window.addEventListener('load', () => {
        // Delay initial position calculation until after page paint
        setTimeout(updateSectionPositions, 50);
    });
    // Initial update - delayed to avoid competing with initial page render
    setTimeout(updateSectionPositions, 150);

    // Scroll effect - throttled
    let ticking = false;
    window.addEventListener('scroll', () => {
        // Navbar visibility toggle
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Mobile menu toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
}

function updateActiveNavLink() {
    // Use cached positions instead of querying DOM (prevents forced reflow)
    const scrollY = window.pageYOffset;

    sectionPositions.forEach(section => {
        if (scrollY > section.top && scrollY <= section.top + section.height) {
            section.navLink?.classList.add('active');
        } else {
            section.navLink?.classList.remove('active');
        }
    });
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                // Use cached section positions if available, otherwise calculate once
                const section = sectionPositions?.find(s => s.id === targetId.substring(1));
                const offsetTop = section ? section.top + 100 : target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }, { passive: true });
    });
}

// ==================== COUNTER ANIMATION ====================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-count');
        const count = +counter.innerText;
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounter(counter), 10);
        } else {
            counter.innerText = target + '+';
        }
    };
    
    // Intersection Observer for counter animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ==================== PORTFOLIO FILTER ====================
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            // Filter items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ==================== PROJECT MODAL ====================
const projectData = {
    1: {
        title: 'Online Store',
        category: 'E-commerce',
        image: 'Online Store',
        description: 'A full-featured e-commerce platform built for online retail. The platform includes inventory management, payment gateway integration, and a responsive design that works seamlessly across all devices.',
        features: [
            'Custom e-commerce platform',
            'Payment gateway integration (PayFast, Yoco)',
            'Inventory management system',
            'Order tracking and management',
            'Customer accounts and profiles',
            'Responsive mobile-first design'
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
        client: 'Online Retailer',
        year: '2025'
    },
    2: {
        title: 'Digital Audio Workstation (DAW)',
        category: 'Software',
        image: 'Digital Audio Workstation',
        description: 'A professional audio production software designed for musicians, producers, and audio engineers. Features multi-track recording, MIDI sequencing, and advanced audio processing capabilities.',
        features: [
            'Multi-track audio recording',
            'MIDI sequencing and editing',
            'VST plugin support',
            'Advanced mixing console',
            'Real-time audio effects',
            'Export to multiple formats'
        ],
        technologies: ['C++', 'JUCE Framework', 'WebAudio API', 'FFmpeg'],
        client: 'Audio Pro Solutions',
        year: '2025'
    },
    3: {
        title: 'E-tolling Payment System',
        category: 'Web Development',
        image: 'E-tolling System',
        description: 'An electronic toll collection and payment platform that enables seamless toll payments for motorists. The system includes account management, automated billing, and real-time transaction processing.',
        features: [
            'Electronic toll collection',
            'Account management portal',
            'Automated billing system',
            'Real-time transaction processing',
            'SMS and email notifications',
            'Integration with banking systems'
        ],
        technologies: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis'],
        client: 'Transport Authority',
        year: '2025'
    },
    4: {
        title: 'Task Finder',
        category: 'Software',
        image: 'Task Finder',
        description: 'A comprehensive task management and productivity platform designed to help individuals and teams organize, track, and complete their work efficiently. Features intuitive task creation, priority management, and collaborative tools.',
        features: [
            'Task creation and management',
            'Priority and deadline tracking',
            'Team collaboration tools',
            'Progress visualization',
            'Automated reminders',
            'Integration with calendar apps'
        ],
        technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        client: 'Productivity Solutions',
        year: '2025'
    }
};

function openProjectModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('projectModalBody');
    
    modalBody.innerHTML = `
        <div class="project-header">
            <span class="project-category">${project.category}</span>
            <h2>${project.title}</h2>
        </div>
        
        <div class="project-image">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Crect fill='%230a2918' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23F5E6D3'%3E${encodeURIComponent(project.image)}%3C/text%3E%3C/svg%3E" alt="${project.title}">
        </div>
        
        <div class="project-content">
            <div class="project-section">
                <h3>Project Overview</h3>
                <p>${project.description}</p>
            </div>
            
            <div class="project-section">
                <h3>Key Features</h3>
                <ul class="feature-list">
                    ${project.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
            </div>
            
            <div class="project-section">
                <h3>Technologies</h3>
                <div class="tech-stack">
                    ${project.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>
            
            <div class="project-meta">
                <div class="meta-item">
                    <strong>Client:</strong>
                    <span>${project.client}</span>
                </div>
                <div class="meta-item">
                    <strong>Year:</strong>
                    <span>${project.year}</span>
                </div>
            </div>
        </div>
        
        <div class="project-cta">
            <a href="#contact" class="btn btn-primary" onclick="closeProjectModal()">
                <i class="fas fa-arrow-right"></i> Start Similar Project
            </a>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== FORM HANDLING ====================
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Validate
    if (!data.name || !data.email || !data.service || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Create mailto link with form data
    const subject = `New Website Inquiry from ${data.name} - ${data.service}`;
    const body = `Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Service: ${data.service}
Budget: ${data.budget || 'Not specified'}

Message:
${data.message}

---
Sent from Metra Innovations Website`;

    // Open email client
    window.location.href = `mailto:info@metramarket.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Show success notification
    showNotification('Opening your email client... Please send the email to complete your inquiry.', 'success');
    
    // Reset form after delay
    setTimeout(() => {
        event.target.reset();
    }, 2000);
}

function handleNewsletterSubmit(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate subscription
    const submitBtn = event.target.querySelector('button');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    setTimeout(() => {
        console.log('Newsletter subscription:', email);
        showNotification('Thank you for subscribing!', 'success');
        event.target.reset();
        submitBtn.innerHTML = originalHTML;
    }, 1500);
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : type === 'error' ? 'linear-gradient(135deg, #DC143C, #c41e3a)' : 'linear-gradient(135deg, #0a2918, #0f3d24)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ==================== ANIMATIONS ====================
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.service-card, .portfolio-item, .testimonial-card, .process-step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==================== UTILITY FUNCTIONS ====================
// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProjectModal();
        closeCareersPopup();
    }
});

// ==================== CAREERS POPUP ====================
function showCareersPopup() {
    const modal = document.getElementById('careersModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCareersPopup() {
    const modal = document.getElementById('careersModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==================== SOCIAL MEDIA SHARING ====================
function initSocialSharing() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    const shareData = {
        title: 'Metra Innovations - South African Software Development Company',
        text: 'Check out Metra Innovations - Leading South African Software Development Company specializing in Web Development, Software Solutions, and E-commerce Platforms.',
        url: window.location.href
    };

    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.querySelector('i').className;
            
            if (platform.includes('facebook-f')) {
                openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
            } else if (platform.includes('twitter')) {
                openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`);
            } else if (platform.includes('linkedin-in')) {
                openShareWindow(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`);
            } else if (platform.includes('github')) {
                window.open('https://github.com/', '_blank');
            } else if (platform.includes('instagram')) {
                window.open('https://instagram.com/', '_blank');
            }
        });
    });
}

function openShareWindow(url) {
    window.open(url, '_blank', 'width=600,height=400,left=' + (screen.width / 2 - 300) + ',top=' + (screen.height / 2 - 200));
}

// Preload images
function preloadImages(images) {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

console.log('💼 Metra Innovations - Ready to Build Something Great');
console.log('📧 Contact: hello@metrainnovations.co.za');
console.log('📞 Phone: +27 11 123 4567');

// ==================== ADMIN DASHBOARD ====================
let isAdminLoggedIn = false;
let contactQueries = [];
let newsletterSubscribers = [];
let analyticsData = {
    visits: 0,
    users: 0,
    pageViews: { home: 0, services: 0, portfolio: 0, contact: 0 },
    dailyViews: [0, 0, 0, 0, 0, 0, 0],
    devices: { desktop: 0, mobile: 0, tablet: 0 }
};

// Load data from localStorage
function loadAdminData() {
    const savedQueries = localStorage.getItem('metraQueries');
    const savedSubscribers = localStorage.getItem('metraSubscribers');
    const savedAnalytics = localStorage.getItem('metraAnalytics');

    if (savedQueries) contactQueries = JSON.parse(savedQueries);
    if (savedSubscribers) newsletterSubscribers = JSON.parse(savedSubscribers);
    if (savedAnalytics) analyticsData = JSON.parse(savedAnalytics);

    console.log('📊 Admin Data Loaded:', {
        queries: contactQueries.length,
        subscribers: newsletterSubscribers.length,
        visits: analyticsData.visits
    });

    updateAdminDashboard();
}

// Save data to localStorage
function saveAdminData() {
    localStorage.setItem('metraQueries', JSON.stringify(contactQueries));
    localStorage.setItem('metraSubscribers', JSON.stringify(newsletterSubscribers));
    localStorage.setItem('metraAnalytics', JSON.stringify(analyticsData));
    
    console.log('💾 Admin Data Saved:', {
        queries: contactQueries.length,
        subscribers: newsletterSubscribers.length
    });
    
    updateAdminDashboard();
}

// Track page visit
function trackPageVisit() {
    analyticsData.visits++;
    analyticsData.users = Math.floor(analyticsData.visits * 0.7);

    // Track page views
    const hash = window.location.hash || '#home';
    const pageMap = { '#home': 'home', '#services': 'services', '#portfolio': 'portfolio', '#contact': 'contact' };
    const page = pageMap[hash] || 'home';
    analyticsData.pageViews[page]++;

    // Track device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    if (isTablet) analyticsData.devices.tablet++;
    else if (isMobile) analyticsData.devices.mobile++;
    else analyticsData.devices.desktop++;

    // Update daily views (simulate)
    const todayIndex = new Date().getDay();
    analyticsData.dailyViews[todayIndex]++;

    saveAdminData();
}

// Update admin dashboard UI
function updateAdminDashboard() {
    // Update stats
    document.getElementById('totalVisits').textContent = analyticsData.visits.toLocaleString();
    document.getElementById('uniqueUsers').textContent = analyticsData.users.toLocaleString();
    document.getElementById('totalQueries').textContent = contactQueries.length;
    document.getElementById('totalSubscribers').textContent = newsletterSubscribers.length;

    // Update badges
    document.getElementById('queriesCount').textContent = contactQueries.length;
    document.getElementById('subscribersCount').textContent = newsletterSubscribers.length;

    // Update page views
    document.getElementById('homeViews').textContent = analyticsData.pageViews.home.toLocaleString();
    document.getElementById('servicesViews').textContent = analyticsData.pageViews.services.toLocaleString();
    document.getElementById('portfolioViews').textContent = analyticsData.pageViews.portfolio.toLocaleString();
    document.getElementById('contactViews').textContent = analyticsData.pageViews.contact.toLocaleString();

    // Update device breakdown
    const totalDevices = analyticsData.devices.desktop + analyticsData.devices.mobile + analyticsData.devices.tablet;
    if (totalDevices > 0) {
        document.getElementById('desktopPercent').textContent = Math.round((analyticsData.devices.desktop / totalDevices) * 100) + '%';
        document.getElementById('mobilePercent').textContent = Math.round((analyticsData.devices.mobile / totalDevices) * 100) + '%';
        document.getElementById('tabletPercent').textContent = Math.round((analyticsData.devices.tablet / totalDevices) * 100) + '%';
    }

    // Update recent queries
    const recentQueriesList = document.getElementById('recentQueriesList');
    if (contactQueries.length > 0) {
        recentQueriesList.innerHTML = contactQueries.slice(-3).reverse().map(q => `
            <div class="query-item">
                <div class="query-header">
                    <div class="query-info">
                        <h4>${escapeHtml(q.name)}</h4>
                        <span>${escapeHtml(q.email)}</span>
                    </div>
                    <span class="query-date">${formatDate(q.date)}</span>
                </div>
                <p class="query-body">${escapeHtml(q.message).substring(0, 100)}...</p>
            </div>
        `).join('');
    }

    // Update recent subscribers
    const recentSubscribersList = document.getElementById('recentSubscribersList');
    if (newsletterSubscribers.length > 0) {
        recentSubscribersList.innerHTML = newsletterSubscribers.slice(-3).reverse().map(s => `
            <div class="subscriber-item">
                <div class="query-header">
                    <div class="query-info">
                        <h4>${escapeHtml(s.email)}</h4>
                        <span>Newsletter Subscriber</span>
                    </div>
                    <span class="query-date">${formatDate(s.date)}</span>
                </div>
            </div>
        `).join('');
    }

    // Update queries list
    const queriesList = document.getElementById('queriesList');
    if (contactQueries.length > 0) {
        queriesList.innerHTML = contactQueries.reverse().map((q, index) => `
            <div class="query-item">
                <div class="query-header">
                    <div class="query-info">
                        <h4>${escapeHtml(q.name)}</h4>
                        <span>${escapeHtml(q.email)} ${q.phone ? '• ' + escapeHtml(q.phone) : ''}</span>
                    </div>
                    <span class="query-date">${formatDate(q.date)}</span>
                </div>
                <p class="query-body">${escapeHtml(q.message)}</p>
                <div class="query-meta">
                    <div class="meta-item"><strong>Service:</strong><span>${escapeHtml(q.service)}</span></div>
                    <div class="meta-item"><strong>Budget:</strong><span>${q.budget || 'Not specified'}</span></div>
                </div>
                <div class="query-actions">
                    <a href="mailto:${escapeHtml(q.email)}" class="btn-xs primary">
                        <i class="fas fa-reply"></i> Reply
                    </a>
                    <button class="btn-xs secondary" onclick="deleteQuery(${contactQueries.length - 1 - index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update subscribers list
    const subscribersList = document.getElementById('subscribersList');
    if (newsletterSubscribers.length > 0) {
        subscribersList.innerHTML = newsletterSubscribers.reverse().map((s, index) => `
            <div class="subscriber-item">
                <div class="query-header">
                    <div class="query-info">
                        <h4>${escapeHtml(s.email)}</h4>
                        <span>Newsletter Subscriber</span>
                    </div>
                    <span class="query-date">${formatDate(s.date)}</span>
                </div>
                <div class="query-actions">
                    <a href="mailto:${escapeHtml(s.email)}" class="btn-xs primary">
                        <i class="fas fa-envelope"></i> Email
                    </a>
                    <button class="btn-xs secondary" onclick="deleteSubscriber(${newsletterSubscribers.length - 1 - index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update page views chart
    updatePageViewsChart();
}

// Update page views chart
function updatePageViewsChart() {
    const chartBars = document.getElementById('pageViewsBars');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxValue = Math.max(...analyticsData.dailyViews, 1);

    chartBars.innerHTML = analyticsData.dailyViews.map((value, index) => `
        <div class="chart-bar">
            <div class="chart-bar-fill" style="height: ${(value / maxValue) * 150}px;"></div>
            <span class="chart-bar-label">${days[index]}</span>
        </div>
    `).join('');
}

// Admin login functions
let isPasscodeVerified = false;
const ADMIN_PASSCODE = '1289';

function openAdminLogin() {
    // Open passcode modal first
    const passcodeModal = document.getElementById('adminPasscodeModal');
    if (passcodeModal) {
        passcodeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on passcode input
        setTimeout(() => {
            const passcodeInput = document.getElementById('adminPasscode');
            if (passcodeInput) passcodeInput.focus();
        }, 300);
    }
}

function closeAdminPasscode() {
    const modal = document.getElementById('adminPasscodeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Clear error
        const errorEl = document.getElementById('passcodeError');
        if (errorEl) errorEl.style.display = 'none';
        // Clear input
        const passcodeInput = document.getElementById('adminPasscode');
        if (passcodeInput) passcodeInput.value = '';
    }
}

function handlePasscodeSubmit(event) {
    event.preventDefault();
    const passcode = document.getElementById('adminPasscode').value;
    const errorEl = document.getElementById('passcodeError');

    if (passcode === ADMIN_PASSCODE) {
        // Passcode correct - close passcode modal, open login modal
        isPasscodeVerified = true;
        closeAdminPasscode();
        
        // Small delay for smooth transition
        setTimeout(() => {
            openAdminLoginAfterPasscode();
        }, 300);
    } else {
        // Passcode incorrect - show error
        if (errorEl) {
            errorEl.textContent = '❌ Incorrect passcode. Access denied.';
            errorEl.style.display = 'block';
            errorEl.style.color = '#ff4d6d';
            errorEl.style.fontSize = '0.875rem';
            errorEl.style.marginTop = '1rem';
        }
        
        // Shake animation
        const form = event.target;
        form.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
        
        showNotification('Incorrect passcode. Access denied.', 'error');
    }
}

function openAdminLoginAfterPasscode() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('adminEmail');
            if (emailInput) emailInput.focus();
        }, 300);
    }
}

function closeAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    // Simple demo authentication (in production, use proper backend auth)
    if (email === 'admin@metrainnovations.co.za' && password === 'admin123') {
        isAdminLoggedIn = true;
        closeAdminLogin();
        openDashboard();
        showNotification('Welcome back, Admin!', 'success');
    } else {
        showNotification('Invalid credentials. Please try again.', 'error');
    }
}

function handleAdminLogout() {
    isAdminLoggedIn = false;
    closeDashboard();
    showNotification('Successfully logged out', 'success');
}

function openDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) {
        dashboard.classList.add('active');
        // Force reload data from localStorage to get latest submissions
        loadAdminData();
        console.log('🔄 Dashboard opened, data refreshed from localStorage');
    }
}

function refreshAdminData() {
    console.log('🔄 Manually refreshing admin data...');
    loadAdminData();
    showNotification('Dashboard refreshed!', 'success');
}

function closeDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    if (dashboard) {
        dashboard.classList.remove('active');
    }
}

// Tab switching
function switchTab(tabName) {
    // Update nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.tab === tabName) {
            link.classList.add('active');
        }
    });

    // Update tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard Overview',
        queries: 'Contact Queries',
        newsletter: 'Newsletter Subscribers',
        analytics: 'Analytics & Reports',
        recovery: 'Data Recovery & Export'
    };
    document.getElementById('adminPageTitle').textContent = titles[tabName];

    // Load recovery data when switching to recovery tab
    if (tabName === 'recovery') {
        updateRecoveryTab();
    }
}

// Initialize admin nav
function initAdminNav() {
    document.querySelectorAll('.admin-nav-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Delete functions
function deleteQuery(index) {
    if (confirm('Are you sure you want to delete this query?')) {
        contactQueries.splice(index, 1);
        saveAdminData();
        showNotification('Query deleted successfully', 'success');
    }
}

function deleteSubscriber(index) {
    if (confirm('Are you sure you want to remove this subscriber?')) {
        newsletterSubscribers.splice(index, 1);
        saveAdminData();
        showNotification('Subscriber removed successfully', 'success');
    }
}

// Export functions
function exportQueries() {
    const csvContent = 'Name,Email,Phone,Service,Budget,Message,Date\n' +
        contactQueries.map(q =>
            `"${q.name}","${q.email}","${q.phone || ''}","${q.service}","${q.budget || ''}","${q.message.replace(/"/g, '""')}","${q.date}"`
        ).join('\n');

    downloadFile(csvContent, 'contact-queries.csv', 'text/csv');
}

function exportSubscribers() {
    const csvContent = 'Email,Date\n' +
        newsletterSubscribers.map(s => `"${s.email}","${s.date}"`).join('\n');

    downloadFile(csvContent, 'newsletter-subscribers.csv', 'text/csv');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Modify contact form handler to save queries
const originalHandleContactSubmit = window.handleContactSubmit;
window.handleContactSubmit = function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Validate
    if (!data.name || !data.email || !data.service || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Validate custom service field if Other or Custom Solutions is selected
    if ((data.service === 'other' || data.service === 'custom-solutions') && !data.customService) {
        showNotification('Please specify your service requirement', 'error');
        return;
    }

    // Determine the service name to display
    let serviceName = data.service;
    if (data.service === 'custom-solutions') {
        serviceName = 'Custom Solutions' + (data.customService ? ` - ${data.customService}` : '');
    } else if (data.service === 'other') {
        serviceName = 'Other' + (data.customService ? ` - ${data.customService}` : '');
    }

    // Save query to admin dashboard
    contactQueries.push({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        service: serviceName,
        budget: data.budget || '',
        message: data.message,
        customService: data.customService || '',
        date: new Date().toISOString()
    });
    saveAdminData();

    // Show success notification and modal
    showNotification('Message sent successfully! We will get back to you soon.', 'success');
    showSubmissionSuccess(data.name);

    // Reset form
    event.target.reset();
    const customServiceGroup = document.getElementById('customServiceGroup');
    if (customServiceGroup) {
        customServiceGroup.style.display = 'none';
    }
};

// Show submission success modal
function showSubmissionSuccess(clientName) {
    const successModal = document.getElementById('submissionSuccessModal');
    const successMessage = document.getElementById('successMessage');
    
    if (successMessage) {
        successMessage.innerHTML = `
            <p>Dear <strong>${escapeHtml(clientName)}</strong>,</p>
            <p>Thank you for contacting Metra Innovations! We have received your inquiry and our team will review it shortly.</p>
            <p>Expected response time: <strong>24-48 hours</strong></p>
            <p class="success-note">You can also view your submission status in our admin dashboard or contact us directly at <strong>065 160 1948</strong>.</p>
        `;
    }
    
    if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSubmissionSuccess() {
    const successModal = document.getElementById('submissionSuccessModal');
    if (successModal) {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Modify newsletter handler to save subscribers
const originalHandleNewsletterSubmit = window.handleNewsletterSubmit;
window.handleNewsletterSubmit = function(event) {
    event.preventDefault();

    const email = event.target.querySelector('input[type="email"]').value;

    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Save subscriber
    newsletterSubscribers.push({
        email: email,
        date: new Date().toISOString()
    });
    saveAdminData();

    // Simulate subscription
    const submitBtn = event.target.querySelector('button');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    setTimeout(() => {
        console.log('Newsletter subscription:', email);
        showNotification('Thank you for subscribing!', 'success');
        event.target.reset();
        submitBtn.innerHTML = originalHTML;
    }, 1500);
};

// ==================== DATA RECOVERY & EXPORT ====================
function refreshRecoveryData() {
    console.log('🔄 Refreshing recovery data...');
    loadAdminData();
    updateRecoveryTab();
    showNotification('Recovery data refreshed!', 'success');
}

function updateRecoveryTab() {
    // Update recovery stats
    document.getElementById('recoveryQueryCount').textContent = contactQueries.length;
    document.getElementById('recoverySubscriberCount').textContent = newsletterSubscribers.length;
    document.getElementById('recoveryVisitCount').textContent = analyticsData.visits || 0;

    // Update queries table
    const queriesList = document.getElementById('recoveryQueriesList');
    if (contactQueries.length > 0) {
        queriesList.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Service</th>
                        <th>Budget</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${contactQueries.map(q => `
                        <tr>
                            <td>${escapeHtml(q.name)}</td>
                            <td>${escapeHtml(q.email)}</td>
                            <td>${escapeHtml(q.phone || 'N/A')}</td>
                            <td>${escapeHtml(q.service)}</td>
                            <td>${q.budget || 'Not specified'}</td>
                            <td>${formatDate(q.date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        queriesList.innerHTML = '<p class="empty-state">No queries found in localStorage</p>';
    }

    // Update subscribers table
    const subscribersList = document.getElementById('recoverySubscribersList');
    if (newsletterSubscribers.length > 0) {
        subscribersList.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${newsletterSubscribers.map(s => `
                        <tr>
                            <td>${escapeHtml(s.email)}</td>
                            <td>${formatDate(s.date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        subscribersList.innerHTML = '<p class="empty-state">No subscribers found in localStorage</p>';
    }

    // Update raw JSON data
    const rawData = document.getElementById('recoveryRawData');
    rawData.innerHTML = `<pre class="json-pre">${JSON.stringify({
        queries: contactQueries,
        subscribers: newsletterSubscribers,
        analytics: analyticsData
    }, null, 2)}</pre>`;
}

function exportQueries() {
    if (contactQueries.length === 0) {
        showNotification('No queries to export', 'error');
        return;
    }
    const dataStr = JSON.stringify(contactQueries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metra-queries-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Queries exported successfully!', 'success');
}

function exportSubscribers() {
    if (newsletterSubscribers.length === 0) {
        showNotification('No subscribers to export', 'error');
        return;
    }
    const dataStr = JSON.stringify(newsletterSubscribers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metra-subscribers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Subscribers exported successfully!', 'success');
}

function exportAsCSV() {
    if (contactQueries.length === 0 && newsletterSubscribers.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }

    if (contactQueries.length > 0) {
        const headers = ['Name', 'Email', 'Phone', 'Service', 'Budget', 'Message', 'Date'];
        const csvContent = [
            headers.join(','),
            ...contactQueries.map(q => 
                [q.name, q.email, q.phone || '', q.service, q.budget || '', `"${(q.message || '').replace(/"/g, '""')}"`, q.date].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `metra-queries-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showNotification('Queries exported as CSV!', 'success');
    }
}

// Initialize admin on page load
document.addEventListener('DOMContentLoaded', () => {
    trackPageVisit();
    initAdminNav();
    loadAdminData();
});

// ==================== LIGHTBOX FUNCTIONALITY ====================
function openLightbox(imageSrc) {
    const modal = document.getElementById('lightboxModal');
    const image = document.getElementById('lightboxImage');
    
    if (modal && image) {
        image.src = imageSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close lightbox with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// ==================== CUSTOM SERVICE FIELD ====================
function toggleCustomServiceField() {
    const serviceSelect = document.getElementById('service');
    const customServiceGroup = document.getElementById('customServiceGroup');
    const customServiceInput = document.getElementById('customService');

    if (serviceSelect.value === 'other' || serviceSelect.value === 'custom-solutions') {
        customServiceGroup.style.display = 'flex';
        customServiceInput.required = true;
    } else {
        customServiceGroup.style.display = 'none';
        customServiceInput.required = false;
        customServiceInput.value = '';
    }
}
