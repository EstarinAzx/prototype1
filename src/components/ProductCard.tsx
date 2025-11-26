// ============================================
// IMPORTS
// ============================================
import type { Item } from '../data/items';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { soundManager } from '../utils/soundManager';
import { Heart } from 'lucide-react';

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
// Purpose: Display individual product with interactive features
// Features:
// - Hover effects with sound
// - Add to cart button
// - Favorite/wishlist toggle
// - Rarity-based visual styling
// - Click to view detailed modal
// ============================================

interface ProductCardProps {
    item: Item;                    // Product data to display
    onSelect: (item: Item) => void; // Callback to open item modal
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onSelect }) => {
    // ============================================
    // CONTEXT HOOKS
    // ============================================
    // Access cart operations and favorites from global state
    const { addToCart, favorites, toggleFavorite } = useStore();

    // ============================================
    // EVENT HANDLERS
    // ============================================

    /**
     * Handle "Add to Cart" button click
     * - Stops event propagation (prevents card click)
     * - Plays UI click sound
     * - Adds item to shopping cart
     */
    const handleBuy = (e: React.MouseEvent) => {
        e.stopPropagation();       // Don't trigger card click
        soundManager.playClick();  // Audio feedback
        addToCart(item);           // Add to cart via context
    };

    /**
     * Handle favorite/wishlist toggle
     * - Stops event propagation
     * - Toggles item in favorites list
     */
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(item.id);
    };

    // ============================================
    // COMPUTED VALUES
    // ============================================
    // Check if this item is in the favorites list
    const isFavorite = favorites.includes(item.id);

    // ============================================
    // RENDER / UI
    // ============================================
    return (
        <motion.div
            // Dynamic class based on rarity (legendary/epic/rare/common)
            className={`product-card rarity-${item.rarity}`}

            // ============================================
            // ANIMATIONS & INTERACTIONS
            // ============================================
            whileHover={{ scale: 1.02 }}              // Slight zoom on hover
            onClick={() => onSelect(item)}             // Open detail modal
            initial={{ opacity: 0, y: 20 }}            // Fade in from below
            animate={{ opacity: 1, y: 0 }}             // Animate to visible
            onMouseEnter={() => soundManager.playHover()} // Play hover sound
        >
            {/* ============================================
                PRODUCT IMAGE SECTION
                ============================================ */}
            <div className="card-image">
                {/* Rarity badge (legendary/epic/rare/common) */}
                <div className={`rarity-badge ${item.rarity}`}>{item.rarity}</div>

                {/* ============================================
                    FAVORITE/WISHLIST BUTTON
                    Toggles heart icon and saves to user's favorites
                    ============================================ */}
                <button
                    onClick={handleFavorite}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        // Pink border if favorited, gray if not
                        border: '1px solid ' + (isFavorite ? '#ff0055' : '#666'),
                        padding: '5px',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    {/* Heart icon - filled if favorited */}
                    <Heart
                        size={18}
                        fill={isFavorite ? '#ff0055' : 'none'}
                        color={isFavorite ? '#ff0055' : '#fff'}
                    />
                </button>

                {/* Product image from Unsplash */}
                <img src={item.image} alt={item.name} />
            </div>

            {/* ============================================
                PRODUCT INFO SECTION
                ============================================ */}
            <div className="card-info">
                {/* Item name */}
                <div className="card-title">{item.name}</div>
                {/* Item category (weapon/implant/gear) */}
                <div className="card-type">{item.type}</div>

                {/* ============================================
                    STATS DISPLAY
                    Dynamically render all item statistics
                    ============================================ */}
                <div className="card-stats">
                    {Object.entries(item.stats).map(([key, val]) => (
                        <div className="stat-row" key={key}>
                            <span>{key.toUpperCase()}</span>
                            <span style={{ color: '#fff' }}>{val}</span>
                        </div>
                    ))}
                </div>

                {/* Price display with currency symbol */}
                <div className="card-price">¥ {item.price.toLocaleString()}</div>

                {/* ============================================
                    ADD TO CART BUTTON
                    ============================================ */}
                <button className="btn-buy" onClick={handleBuy}>
                    ADD TO LOADOUT
                </button>
            </div>
        </motion.div>
    );
};
