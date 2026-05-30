// ── Hero parallax scroll ──
window.addEventListener('scroll', function () {
    const hero = document.querySelector('.hero-container');
    if (!hero) return;
    const scrollPos = window.scrollY;
    const maxScroll = window.innerHeight;
    const scrollProgress = Math.min(scrollPos / maxScroll, 1);
    hero.style.backgroundSize = (100 + scrollProgress * 80) + '%';
});

// ── Brand cards staggered animation ──
window.addEventListener('scroll', () => {
    const brandCards = document.querySelectorAll('.brand-card');
    if (!brandCards.length) return;
    const triggerBottom = window.innerHeight * 0.88;
    brandCards.forEach((card, index) => {
        if (card.getBoundingClientRect().top < triggerBottom) {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        }
    });
});

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ── Smart sticky navbar ──
const header = document.querySelector('header');
const isHomePage = document.body.classList.contains('home-page');

if (header) {
    let lastScrollY = window.scrollY;
    let hasScrolled = false;

    // Set initial state on home page
    if (isHomePage && window.scrollY === 0) {
        header.classList.add('transparent');
    }

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // ── Home page: transparent → solid on scroll ──
        if (isHomePage) {
            if (currentScrollY === 0) {
                // Back at very top — go transparent again
                header.classList.add('transparent');
                header.classList.remove('scrolled');
            } else {
                // Any scroll — make solid
                header.classList.remove('transparent');
                header.classList.add('scrolled');
            }
        }

        // ── All pages: hide on scroll down, show on scroll up ──
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    });
}