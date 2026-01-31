/**
 * SPACEGOODS FLOATING CART
 * Handles floating cart FAB, add to cart animations, and badge updates
 */

class FloatingCart {
    constructor() {
        this.cartTriggers = []; // Can be multiple buttons
        this.badges = []; // Can be multiple badges
        this.count = 0;
        this.items = [];
    }

    init() {
        // Get DOM elements
        this.cartTriggers = document.querySelectorAll('.cart-fab, .nav-cart');
        this.badges = document.querySelectorAll('.cart-badge, .nav-cart-badge');

        if (this.cartTriggers.length === 0) {
            console.warn('Cart trigger elements not found');
            return;
        }

        // Load cart from localStorage
        this.loadCart();

        // Bind clicks to all cart triggers
        this.cartTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => this.openCart(e));
        });

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
        
        // Recalculate total items count
        this.count = this.items.reduce((sum, current) => sum + current.quantity, 0);

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
     * Update badge count on all badge elements
     */
    updateBadge() {
        this.badges.forEach(badge => {
            if (badge) {
                badge.textContent = this.count;

                if (this.count > 99) {
                    badge.textContent = '99+';
                }
                
                // Special handling for the FAB badge display style
                if (badge.classList.contains('cart-badge')) {
                    if (this.count === 0) {
                        badge.style.display = 'none';
                    } else {
                        badge.style.display = 'flex';
                    }
                }
            }
        });
    }

    /**
     * Pulse animation on cart FAB
     */
    pulseAnimation() {
        const fab = document.querySelector('.cart-fab');
        if (fab) {
            fab.classList.add('pulse');

            setTimeout(() => {
                fab.classList.remove('pulse');
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
     * Open cart and trigger WhatsApp checkout
     */
    openCart(e) {
        e.preventDefault(); // Prevents the <a> tag from navigating to #cart
        
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        if (this.items.length === 0) {
            alert('Your cart is empty. Add some cosmic goods!');
            return;
        }

        // A simple confirmation dialog before redirecting
        const summary = this.getCartSummary();
        const total = this.getTotal();
        const confirmationMessage = `Your Order Summary:\n\n${summary}\n\nTotal: $${total.toFixed(2)}\n\nProceed to WhatsApp to complete your order?`;

        if (confirm(confirmationMessage)) {
            this.whatsappCheckout();
        }
    }

    /**
     * Generate WhatsApp link and redirect
     */
    whatsappCheckout() {
        const summary = this.getCartSummary();
        const total = this.getTotal();
        const phoneNumber = '212708897624';

        const message = `*New SpaceGoods Order!*\n\nHello! I'd like to place the following order:\n\n${summary}\n\n*Total: $${total.toFixed(2)}*\n\nPlease let me know the next steps. Thank you!`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        // Redirect to WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        // Optional: clear cart after sending to WhatsApp. Let's leave it for now.
        // this.clearCart();
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
