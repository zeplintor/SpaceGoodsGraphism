/**
 * SPACEGOODS FLOATING CART
 * Handles floating cart FAB, add to cart animations, and badge updates
 */

class FloatingCart {
    constructor() {
        this.fab = null;
        this.badge = null;
        this.count = 0;
        this.items = [];
    }

    init() {
        // Get DOM elements
        this.fab = document.querySelector('.cart-fab');
        this.badge = document.querySelector('.cart-badge');

        if (!this.fab || !this.badge) {
            console.warn('Cart FAB elements not found');
            return;
        }

        // Load cart from localStorage
        this.loadCart();

        // Bind FAB click to navigate to cart/checkout
        this.fab.addEventListener('click', () => this.openCart());

        // Listen for add to cart events
        document.addEventListener('addToCart', (e) => this.addItem(e.detail));

        // Bind all "Add to Cart" buttons
        this.bindAddToCartButtons();

        console.log('Floating cart initialized');
    }

    /**
     * Bind all add to cart buttons on the page
     */
    bindAddToCartButtons() {
        const buttons = document.querySelectorAll('[data-add-to-cart]');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const productId = button.dataset.productId || 'unknown';
                const productName = button.dataset.productName || 'Product';
                const productPrice = parseFloat(button.dataset.productPrice) || 0;

                this.addItem({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });

                // Visual feedback on button
                this.animateButton(button);
            });
        });

        console.log(`Bound ${buttons.length} add-to-cart buttons`);
    }

    /**
     * Add item to cart
     */
    addItem(item) {
        // Check if item already exists
        const existingItem = this.items.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            });
        }

        this.count++;
        this.updateBadge();
        this.pulseAnimation();
        this.saveCart();

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 5, 10]);
        }

        console.log('Added to cart:', item);
    }

    /**
     * Remove item from cart
     */
    removeItem(itemId) {
        const index = this.items.findIndex(i => i.id === itemId);

        if (index !== -1) {
            this.count -= this.items[index].quantity;
            this.items.splice(index, 1);
            this.updateBadge();
            this.saveCart();
        }
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        this.items = [];
        this.count = 0;
        this.updateBadge();
        this.saveCart();
    }

    /**
     * Update badge count
     */
    updateBadge() {
        if (this.badge) {
            this.badge.textContent = this.count;

            if (this.count > 99) {
                this.badge.textContent = '99+';
            }

            // Hide badge if count is 0
            if (this.count === 0) {
                this.badge.style.display = 'none';
            } else {
                this.badge.style.display = 'flex';
            }
        }
    }

    /**
     * Pulse animation on cart FAB
     */
    pulseAnimation() {
        if (this.fab) {
            this.fab.classList.add('pulse');

            setTimeout(() => {
                this.fab.classList.remove('pulse');
            }, 600);
        }
    }

    /**
     * Animate add to cart button
     */
    animateButton(button) {
        const originalText = button.textContent;

        button.textContent = '✓ Added!';
        button.style.background = 'var(--red)';
        button.style.color = 'var(--bg)';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 1500);
    }

    /**
     * Open cart (navigate to cart page or show modal)
     */
    openCart() {
        // Option 1: Navigate to cart page
        // window.location.href = 'cart.html';

        // Option 2: Show cart modal/sidebar
        console.log('Cart clicked:', this.items);

        // For now, just log cart contents
        alert(`Cart: ${this.count} item(s)\n\n${this.getCartSummary()}`);

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    /**
     * Get cart summary text
     */
    getCartSummary() {
        if (this.items.length === 0) {
            return 'Your cart is empty';
        }

        return this.items.map(item =>
            `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
    }

    /**
     * Get cart total
     */
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem('spacegoods_cart', JSON.stringify({
                items: this.items,
                count: this.count
            }));
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const savedCart = localStorage.getItem('spacegoods_cart');

            if (savedCart) {
                const cart = JSON.parse(savedCart);
                this.items = cart.items || [];
                this.count = cart.count || 0;
                this.updateBadge();
            }
        } catch (e) {
            console.error('Failed to load cart:', e);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.spaceGoodsCart = new FloatingCart();
    window.spaceGoodsCart.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingCart;
}
