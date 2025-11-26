// ============================================
// IMPORTS
// ============================================
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ItemModal } from './ItemModal';
import type { Item } from '../data/items';
import { AnimatePresence, motion } from 'framer-motion';

// ============================================
// PRODUCT GRID COMPONENT
// ============================================
// Purpose: Display grid of filtered product cards
// Features:
// - Renders filtered/sorted items from StoreContext
// - Handles individual item selection for modal display
// - Animated grid layout transitions
// ============================================

export const ProductGrid: React.FC = () => {
    // ============================================
    // CONTEXT & STATE
    // ============================================
    // Get filtered items from StoreContext (already filtered by search/category/sort)
    const { filteredItems } = useStore();

    // Local state to track which item modal is open
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    // ============================================
    // RENDER / UI
    // ============================================
    return (
        <>
            {/* ============================================
                ANIMATED PRODUCT GRID
                Displays all filtered items as ProductCard components
                ============================================ */}
            <motion.main
                className="product-grid"
                id="product-grid"
                layout  // Animate position changes when items are filtered/sorted
            >
                <AnimatePresence>
                    {/* Map each item to a ProductCard */}
                    {filteredItems.map(item => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            onSelect={setSelectedItem}  // Open modal when card is clicked
                        />
                    ))}
                </AnimatePresence>
            </motion.main>

            {/* ============================================
                ITEM DETAIL MODAL
                Shows when user clicks on a product card
                ============================================ */}
            {selectedItem && (
                <ItemModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}  // Close modal
                />
            )}
        </>
    );
};
