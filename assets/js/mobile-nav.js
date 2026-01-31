/**
 * SPACEGOODS MOBILE NAVIGATION
 * Handles hamburger menu, drawer, and swipe gestures
 */

class MobileNav {
    constructor() {
        this.hamburger = null;
        this.drawer = null;
        this.overlay = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isOpen = false;
    }

    init() {
        // Get DOM elements
        this.hamburger = document.querySelector('.mobile-menu-btn');
        this.drawer = document.querySelector('.mobile-drawer');
        this.overlay = document.querySelector('.drawer-overlay');

        // Check if elements exist
        if (!this.hamburger || !this.drawer || !this.overlay) {
            console.warn('Mobile nav elements not found');
            return;
        }

        // Bind event listeners
        this.hamburger.addEventListener('click', () => this.toggle());
        this.overlay.addEventListener('click', () => this.close());

        // Drawer swipe gestures
        this.drawer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.drawer.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Close on navigation link click
        const drawerLinks = this.drawer.querySelectorAll('.drawer-nav a');
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.close(), 200);
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Set active link based on current page
        this.setActiveLink();

        console.log('Mobile navigation initialized');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.hamburger.classList.add('open');
        this.drawer.classList.add('open');
        this.overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        document.body.classList.add('drawer-open');
        this.isOpen = true;

        // Haptic feedback (if supported)
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    close() {
        this.hamburger.classList.remove('open');
        this.drawer.classList.remove('open');
        this.overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        document.body.classList.remove('drawer-open');
        this.isOpen = false;

        // Haptic feedback (if supported)
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;

        // Swipe left to close (minimum 50px)
        if (swipeDistance > 50) {
            this.close();
        }
    }

    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const drawerLinks = this.drawer.querySelectorAll('.drawer-nav a');

        drawerLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const mobileNav = new MobileNav();
    mobileNav.init();
});
