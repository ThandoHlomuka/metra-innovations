// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Metra Innovations - Website Loaded');
    
    initNavbar();
    initSmoothScroll();
    initCounterAnimation();
    initPortfolioFilter();
    initFormValidation();
    initAnimations();
});

// ==================== NAVBAR ====================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
    });
    
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
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
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
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
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
        title: 'Online Fashion Store',
        category: 'E-commerce',
        image: 'E-commerce Platform',
        description: 'A full-featured e-commerce platform built for a fashion retailer. The platform includes inventory management, payment gateway integration, and a responsive design that works seamlessly across all devices.',
        features: [
            'Custom e-commerce platform',
            'Payment gateway integration (PayFast, Yoco)',
            'Inventory management system',
            'Order tracking and management',
            'Customer accounts and profiles',
            'Responsive mobile-first design'
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
        client: 'Fashion Hub',
        year: '2025'
    },
    2: {
        title: 'Business Management System',
        category: 'Web Development',
        image: 'Web Application',
        description: 'A comprehensive CRM system designed for enterprise clients to manage customer relationships, track sales, and automate business processes.',
        features: [
            'Customer relationship management',
            'Sales pipeline tracking',
            'Automated reporting',
            'Team collaboration tools',
            'Integration with existing systems',
            'Role-based access control'
        ],
        technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis'],
        client: 'Enterprise Corp',
        year: '2025'
    },
    3: {
        title: 'Fitness Tracking App',
        category: 'Mobile Apps',
        image: 'Mobile App',
        description: 'A cross-platform fitness and health tracking application that helps users monitor their workouts, track nutrition, and achieve their fitness goals.',
        features: [
            'Workout tracking and planning',
            'Nutrition logging',
            'Progress visualization',
            'Social features and challenges',
            'Integration with wearables',
            'Personalized recommendations'
        ],
        technologies: ['React Native', 'Firebase', 'Node.js', 'HealthKit'],
        client: 'FitTrack',
        year: '2025'
    },
    4: {
        title: 'Inventory Management System',
        category: 'Software',
        image: 'Software Solution',
        description: 'An automated inventory tracking system for a retail chain that streamlines stock management, reduces waste, and improves operational efficiency.',
        features: [
            'Real-time inventory tracking',
            'Automated reorder points',
            'Multi-location support',
            'Barcode scanning',
            'Analytics and reporting',
            'Integration with POS systems'
        ],
        technologies: ['C#', '.NET Core', 'SQL Server', 'Azure'],
        client: 'RetailCo',
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
    
    // Simulate form submission
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        console.log('Form submitted:', data);
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        event.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
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
    }
});

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
