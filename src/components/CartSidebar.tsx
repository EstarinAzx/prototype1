// ============================================
// IMPORTS
// ============================================
import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNotification } from '../context/NotificationContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// CART SIDEBAR COMPONENT
// ============================================
// Purpose: Shopping cart display with checkout functionality
// Features:
// - Real-time cart items display
// - Item removal capability
// - Total price calculation
// - Checkout process integration
// - Mobile-responsive with open/close states
// - Animated cart item transitions
// ============================================

interface CartSidebarProps {
    isOpen?: boolean;      // Control visibility (used for mobile)
    onClose?: () => void;  // Close handler (mobile)
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen = false, onClose }) => {
    // ============================================
    // CONTEXT HOOKS
    // ============================================
    // Get cart data and operations from global state
    const { cart, removeFromCart, checkout } = useStore();
    // Get notification function to show checkout results
    const { showNotification } = useNotification();

    // ============================================
    // COMPUTED VALUES
    // ============================================
    // Calculate total cart value
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // ============================================
    // CHECKOUT HANDLER
    // ============================================
    /**
     * Process checkout transaction
     * 1. Validates cart is not empty
     * 2. Calls checkout() which:
     *    - Verifies user has enough credits
     *    - Deducts credits from user balance
     *    - Moves items from cart to inventory
     *    - Creates transaction record
     *    - Saves to Firebase
     * 3. Shows success/error notification
     * 4. Closes cart sidebar on success
     */
    const handleCheckout = async () => {
        // Don't process if cart is empty
        if (cart.length === 0) return;

        // Execute checkout transaction
        const result = await checkout();

        // Show notification based on result
        showNotification(result.message, result.success ? 'success' : 'error');

        // Close sidebar on successful purchase (mobile)
        if (result.success && onClose) {
            onClose();
        }
    };

    // ============================================
    // RENDER / UI
    // ============================================
    return (
        <aside className={`cyber-sidebar ${isOpen ? 'open' : ''}`}>
            {/* ============================================
                MOBILE CLOSE BUTTON
                Only visible on mobile via CSS
                ============================================ */}
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: '1px solid var(--neon-pink)',
                        color: 'var(--neon-pink)',
                        padding: '8px',
                        cursor: 'pointer',
                        zIndex: 10,
                        display: 'none'  // Shown via .mobile-close-btn CSS
                    }}
                    className="mobile-close-btn"
                >
                    <X size={20} />
                </button>
            )}

            {/* ============================================
                SIDEBAR HEADER
                Shows cart capacity (current/max)
                ============================================ */}
            <div className="sidebar-header">
                <h3>LOADOUT</h3>
                <div className="capacity">{cart.length} / 10</div>
            </div>

            {/* ============================================
                CART ITEMS LIST
                Displays all items in cart with remove buttons
                Uses AnimatePresence for smooth item removal animations
                ============================================ */}
            <div className="cart-items" id="cart-items">
                <AnimatePresence>
                    {cart.length === 0 ? (
                        // Empty cart message
                        <div className="empty-msg">NO ITEMS EQUIPPED</div>
                    ) : (
                        // Map through cart items
                        cart.map((item, index) => (
                            <motion.div
                                key={`${item.id}-${index}`}
                                className="cart-item"
                                // Slide in from right on add
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                // Slide out to left on remove
                                exit={{ x: -20, opacity: 0 }}
                            >
                                <div className="cart-item-info">
                                    {/* Item name */}
                                    <span className="cart-item-name">{item.name}</span>
                                    {/* Item price */}
                                    <span className="cart-item-price">¥ {item.price.toLocaleString()}</span>
                                </div>
                                {/* Remove from cart button */}
                                <button className="btn-remove" onClick={() => removeFromCart(index)}>
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* ============================================
                SIDEBAR FOOTER
                Total price and checkout button
                ============================================ */}
            <div className="sidebar-footer">
                {/* Total price display */}
                <div className="total-row">
                    <span>TOTAL</span>
                    <span id="cart-total">¥ {total.toLocaleString()}</span>
                </div>

                {/* ============================================
                    CHECKOUT BUTTON
                    Processes purchase and moves items to inventory
                    ============================================ */}
                <button className="cyber-btn primary" id="checkout-btn" onClick={handleCheckout}>
                    <span className="btn-content">INITIATE_TRANSACTION</span>
                    <span className="btn-glitch"></span>
                </button>
            </div>
        </aside>
    );
};
