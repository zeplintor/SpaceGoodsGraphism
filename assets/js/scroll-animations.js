/**
 * SPACEGOODS SCROLL ANIMATIONS
 * Handles IntersectionObserver reveals and parallax effects
 */

class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.parallaxElements = [];
        this.isScrolling = false;
    }

    init() {
        this.initScrollReveal();
        this.initParallax();
        console.log('Scroll animations initialized');
    }

    /**
     * Initialize Intersection Observer for scroll reveals
     */
    initScrollReveal() {
        // Create observer with threshold
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');

                        // Optionally unobserve after reveal (one-time animation)
                        // this.observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all scroll-reveal elements
        const revealElements = document.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
        );

        revealElements.forEach(el => {
            this.observer.observe(el);
        });

        console.log(`Observing ${revealElements.length} scroll-reveal elements`);
    }

    /**
     * Initialize parallax scrolling effects
     */
    initParallax() {
        // Get all parallax elements
        this.parallaxElements = document.querySelectorAll('.parallax-element');

        if (this.parallaxElements.length === 0) {
            return;
        }

        // Use requestAnimationFrame for smooth 60fps
        window.addEventListener('scroll', () => {
            if (!this.isScrolling) {
                window.requestAnimationFrame(() => {
                    this.updateParallax();
                    this.isScrolling = false;
                });
                this.isScrolling = true;
            }
        }, { passive: true });

        console.log(`Initialized parallax for ${this.parallaxElements.length} elements`);
    }

    /**
     * Update parallax element positions
     */
    updateParallax() {
        const scrolled = window.pageYOffset;

        this.parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.5;
            const yPos = -(scrolled * speed);

            // Use transform for better performance
            el.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Destroy observer (cleanup)
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const scrollAnimations = new ScrollAnimations();
    scrollAnimations.init();
});

/**
 * Utility: Add staggered delay to children elements
 * Usage: staggerReveal('.features .feature-card', 150);
 */
function staggerReveal(selector, delay = 150) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.transitionDelay = `${index * delay}ms`;
    });
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScrollAnimations, staggerReveal };
}
