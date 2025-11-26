import type { Item } from '../data/items';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ItemModalProps {
    item: Item;
    onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose }) => {
    const { addToCart } = useStore();

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#0a0a0a',
                    border: '2px solid #4ade80',
                    padding: '30px',
                    maxWidth: '800px',
                    width: '90%',
                    position: 'relative',
                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'none',
                        border: 'none',
                        color: '#f59e0b',
                        cursor: 'pointer'
                    }}
                >
                    <X size={32} />
                </button>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', border: '1px solid #333' }} />
                    </div>
                    <div style={{ flex: '1 1 300px', color: '#e0e0e0' }}>
                        <h2 style={{ fontFamily: 'Orbitron', color: '#4ade80', fontSize: '2rem', marginBottom: '10px' }}>{item.name}</h2>
                        <div style={{ color: '#f59e0b', marginBottom: '20px', textTransform: 'uppercase' }}>{item.type}</div>

                        <p style={{ marginBottom: '20px', lineHeight: '1.6', color: '#aaa' }}>
                            {item.description || "No description available."}
                        </p>

                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                            {Object.entries(item.stats).map(([key, val]) => (
                                <div key={key} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px' }}>
                                    <div style={{ color: '#ffe600', fontSize: '0.8rem', textTransform: 'uppercase' }}>{key}</div>
                                    <div style={{ fontSize: '1.1rem' }}>{val}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '2rem', fontFamily: 'Orbitron', color: '#ffe600' }}>
                                ¥ {item.price.toLocaleString()}
                            </div>
                            <button
                                className="cyber-btn"
                                style={{ width: 'auto', padding: '15px 40px' }}
                                onClick={() => {
                                    addToCart(item);
                                    onClose();
                                }}
                            >
                                PURCHASE
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
