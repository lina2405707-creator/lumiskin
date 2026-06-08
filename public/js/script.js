
/* ════════════════════════════════════════════
   LUMISKIN — script.js
   Scroll-reveal animations + Dark mode toggle
════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {

    /* ── Scroll-reveal animations ── */
    const revealTargets = document.querySelectorAll(
        ".image-col, .text-col, .review-card, .brand-card"
    );
    if (revealTargets.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        revealTargets.forEach((el) => observer.observe(el));
    }

    /* ── Dark mode ── */
    const toggleBtn = document.getElementById("theme-switcher-control");

    function applyTheme(theme) {
        const mobileBtn = document.getElementById("theme-switcher-mobile");
        if (theme === "dark") {
            document.documentElement.classList.add("dark-mode");
            if (toggleBtn) toggleBtn.textContent = "☀️";
            if (mobileBtn) mobileBtn.textContent = "☀️";
        } else {
            document.documentElement.classList.remove("dark-mode");
            if (toggleBtn) toggleBtn.textContent = "🌙";
            if (mobileBtn) mobileBtn.textContent = "🌙";
        }
    }
    const saved = localStorage.getItem("lumiskin-theme") || "light";
    applyTheme(saved);

    if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
            const isDark = document.documentElement.classList.contains("dark-mode");
            const newTheme = isDark ? "light" : "dark";
            localStorage.setItem("lumiskin-theme", newTheme);
            applyTheme(newTheme);
        });
    }
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!hamburger || !mobileMenu) return;
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });

    // Close mobile menu on scroll
    window.addEventListener('scroll', () => {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
    });

});
