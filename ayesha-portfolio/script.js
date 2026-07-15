/**
 * Ayeesha - Portfolio Javascript
 * Handcrafted interactive modules for a premium developer experience.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core Modules Initialization
    initTheme();
    initMobileNav();
    initScrollEffects();
    initTypingEffect();
    initNeuralCanvas();
    initRecruiterActions();
});

/* ==========================================================================
   Theme Management (Light / Dark)
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }

    // Toggle theme action
    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
        
        // Trigger canvas update if canvas exists
        window.dispatchEvent(new CustomEvent('theme-changed'));
    });
}

/* ==========================================================================
   Mobile Navigation Menu (Drawer)
   ========================================================================== */
function initMobileNav() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuToggle || !mobileDrawer) return;

    function toggleMenu() {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
            mobileDrawer.classList.remove('open');
            menuToggle.classList.remove('active');
            document.body.classList.remove('drawer-open');
            mobileDrawer.setAttribute('aria-hidden', 'true');
            menuToggle.setAttribute('aria-expanded', 'false');
        } else {
            mobileDrawer.classList.add('open');
            menuToggle.classList.add('active');
            document.body.classList.add('drawer-open');
            mobileDrawer.setAttribute('aria-hidden', 'false');
            menuToggle.setAttribute('aria-expanded', 'true');
        }
    }

    menuToggle.addEventListener('click', toggleMenu);

    // Close drawer when a nav link is clicked
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileDrawer.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close drawer if user clicks outside
    document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('open') && 
            !mobileDrawer.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            toggleMenu();
        }
    });
}

/* ==========================================================================
   Scroll Effects (Sticky Header & Intersection Observer)
   ========================================================================== */
function initScrollEffects() {
    const header = document.getElementById('main-header');
    
    // 1. Sticky Navigation Blur
    const handleScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initial check

    // 2. Smooth Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal, .fade-in-up, .fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

/* ==========================================================================
   Typing Effect (Hero Title)
   ========================================================================== */
function initTypingEffect() {
    const rotateElement = document.querySelector('.txt-rotate');
    if (!rotateElement) return;

    const toRotate = JSON.parse(rotateElement.getAttribute('data-rotate'));
    const period = parseInt(rotateElement.getAttribute('data-period'), 10) || 2000;
    
    let loopNum = 0;
    let txt = '';
    let isDeleting = false;

    function tick() {
        const i = loopNum % toRotate.length;
        const fullTxt = toRotate[i];

        if (isDeleting) {
            txt = fullTxt.substring(0, txt.length - 1);
        } else {
            txt = fullTxt.substring(0, txt.length + 1);
        }

        rotateElement.innerHTML = txt;

        let delta = 150 - Math.random() * 80;

        if (isDeleting) { 
            delta /= 2; // Delete faster
        }

        if (!isDeleting && txt === fullTxt) {
            delta = period; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && txt === '') {
            isDeleting = false;
            loopNum++;
            delta = 500; // Pause before typing next word
        }

        setTimeout(() => {
            requestAnimationFrame(tick);
        }, delta);
    }

    // Start delay
    setTimeout(() => {
        requestAnimationFrame(tick);
    }, 1000);
}

/* ==========================================================================
   Interactive Background Neural Canvas
   ========================================================================== */
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    const particles = [];
    const maxParticles = width < 768 ? 40 : 80;
    const connectionDistance = 120;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    // Color definitions based on current theme
    let colors = getThemeColors();

    window.addEventListener('theme-changed', () => {
        colors = getThemeColors();
    });

    function getThemeColors() {
        const isDark = document.body.classList.contains('dark-theme');
        return {
            particle: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)',
            line: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.06)',
            mouseLine: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.1)'
        };
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            // Screen wrap
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Mouse interaction (gentle repulsion)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.vx -= (dx / distance) * force * 0.02;
                    this.vy -= (dy / distance) * force * 0.02;
                }
            }

            // Speed limit
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > 0.8) {
                this.vx = (this.vx / speed) * 0.8;
                this.vy = (this.vy / speed) * 0.8;
            }

            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.particle;
            ctx.fill();
        }
    }

    // Populate particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.hypot(dx, dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = colors.line;
                    ctx.lineWidth = (connectionDistance - distance) / connectionDistance * 0.8;
                    ctx.stroke();
                }
            }

            // Connection to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = colors.mouseLine;
                    ctx.lineWidth = (mouse.radius - distance) / mouse.radius * 0.6;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    // Mouse Listeners
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize Debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles.length = 0;
            const updatedMax = width < 768 ? 40 : 80;
            for (let i = 0; i < updatedMax; i++) {
                particles.push(new Particle());
            }
        }, 150);
    });

    // Run animation loop
    animate();
}

/* ==========================================================================
   Recruiter Quick Actions (Copy Email)
   ========================================================================== */
function initRecruiterActions() {
    const copyEmailBtn = document.getElementById('action-copy-email');
    const copyText = document.getElementById('copy-email-text');
    const emailToCopy = "hello@ayeesha.dev";

    if (!copyEmailBtn || !copyText) return;

    copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(emailToCopy)
            .then(() => {
                // Visual response on copy success
                const originalText = copyText.textContent;
                copyText.textContent = "Copied to Clipboard!";
                copyEmailBtn.classList.add('copied');
                
                // Add mini checkmark SVG or style shifts
                copyEmailBtn.style.borderColor = "#10b981";
                copyEmailBtn.style.color = "#10b981";

                setTimeout(() => {
                    copyText.textContent = originalText;
                    copyEmailBtn.classList.remove('copied');
                    copyEmailBtn.style.borderColor = "";
                    copyEmailBtn.style.color = "";
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
}
