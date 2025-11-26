import type { Item } from '../data/items';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { soundManager } from '../utils/soundManager';
import { Heart } from 'lucide-react';

interface ProductCardProps {
    item: Item;
    onSelect: (item: Item) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onSelect }) => {
    const { addToCart, favorites, toggleFavorite } = useStore();

    const handleBuy = (e: React.MouseEvent) => {
        e.stopPropagation();
        soundManager.playClick();
        addToCart(item);
    };

    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(item.id);
    };

    const isFavorite = favorites.includes(item.id);

    // Rarity color mapping
    const rarityColors: Record<string, string> = {
        legendary: '#fbbf24',
        epic: '#a855f7',
        rare: '#06b6d4',
        common: '#4ade80'
    };

    const rarityColor = rarityColors[item.rarity] || '#4ade80';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => onSelect(item)}
            onMouseEnter={() => soundManager.playHover()}
            style={{
                background: 'rgba(17, 17, 17, 0.95)',
                border: `1px solid rgba(34, 197, 94, 0.4)`,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
            whileHover={{
                borderColor: rarityColor,
                boxShadow: `0 0 15px ${rarityColor}30`
            }}
        >
            {/* Corner Brackets */}
            <div style={{ position: 'absolute', top: 4, left: 4, width: '15px', height: '15px', borderTop: '2px solid #4ade80', borderLeft: '2px solid #4ade80' }} />
            <div style={{ position: 'absolute', top: 4, right: 4, width: '15px', height: '15px', borderTop: '2px solid #4ade80', borderRight: '2px solid #4ade80' }} />
            <div style={{ position: 'absolute', bottom: 4, left: 4, width: '15px', height: '15px', borderBottom: '2px solid #4ade80', borderLeft: '2px solid #4ade80' }} />
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: '15px', height: '15px', borderBottom: '2px solid #4ade80', borderRight: '2px solid #4ade80' }} />

            {/* Rarity Badge */}
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: rarityColor,
                color: '#000',
                padding: '3px 10px',
                fontFamily: 'Orbitron',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                letterSpacing: '1px',
                zIndex: 10
            }}>
                {item.rarity.toUpperCase()}
            </div>

            {/* Favorite Button */}
            <button
                onClick={handleFavorite}
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid ' + (isFavorite ? '#f59e0b' : 'rgba(34, 197, 94, 0.4)'),
                    padding: '5px',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <Heart
                    size={16}
                    fill={isFavorite ? '#f59e0b' : 'none'}
                    color={isFavorite ? '#f59e0b' : '#4ade80'}
                />
            </button>

            {/* Image Section */}
            <div style={{
                height: '180px',
                overflow: 'hidden',
                borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
                position: 'relative'
            }}>
                <img
                    src={item.image}
                    alt={item.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.85
                    }}
                />
            </div>

            {/* Content Section */}
            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Title */}
                <div style={{
                    fontFamily: 'Orbitron',
                    fontSize: '1rem',
                    color: '#4ade80',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    lineHeight: '1.2'
                }}>
                    {item.name}
                </div>

                {/* Type */}
                <div style={{
                    fontFamily: 'Orbitron',
                    fontSize: '0.85rem',
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    [ {item.type} ]
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    flex: 1
                }}>
                    {Object.entries(item.stats).map(([key, val]) => (
                        <div
                            key={key}
                            style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                padding: '6px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}
                        >
                            <div style={{
                                fontFamily: 'Courier New',
                                fontSize: '0.65rem',
                                color: '#666',
                                textTransform: 'uppercase'
                            }}>
                                {key}
                            </div>
                            <div style={{
                                fontFamily: 'Orbitron',
                                fontSize: '0.9rem',
                                color: '#4ade80',
                                fontWeight: 'bold'
                            }}>
                                {val}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Price */}
                <div style={{
                    fontFamily: 'Orbitron',
                    fontSize: '1.2rem',
                    color: '#fbbf24',
                    textAlign: 'right',
                    letterSpacing: '1px',
                    marginTop: '8px'
                }}>
                    ¥ {item.price.toLocaleString()}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleBuy}
                    style={{
                        background: 'transparent',
                        border: '1px solid #4ade80',
                        color: '#4ade80',
                        padding: '10px',
                        fontFamily: 'Orbitron',
                        fontSize: '0.85rem',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(74, 222, 128, 0.1)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(74, 222, 128, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    ADD TO LOADOUT
                </button>
            </div>
        </motion.div>
    );
};
