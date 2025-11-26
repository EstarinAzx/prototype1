import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TransactionHistoryProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ isOpen, onClose }) => {
    const { transactions } = useStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{
                            maxWidth: '700px',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{
                                fontFamily: 'Orbitron',
                                color: '#4ade80',
                                fontSize: '1.8rem'
                            }}>
                                TRANSACTION LOG
                            </h2>
                            <button onClick={onClose} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#f59e0b'
                            }}>
                                <X size={24} />
                            </button>
                        </div>

                        {transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                                NO TRANSACTIONS RECORDED
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {transactions.map((trans) => (
                                    <div key={trans.id} style={{
                                        background: 'rgba(0, 243, 255, 0.05)',
                                        border: '1px solid #333',
                                        padding: '15px',
                                        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ color: '#ffe600', fontFamily: 'Orbitron' }}>
                                                {new Date(trans.timestamp).toLocaleString()}
                                            </span>
                                            <span style={{ color: '#f59e0b', fontFamily: 'Orbitron', fontSize: '1.2rem' }}>
                                                ¥ {trans.total.toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#999' }}>
                                            {trans.items.map(item => item.name).join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
