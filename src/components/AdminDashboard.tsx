import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { X, Package, Users, BarChart3 } from 'lucide-react';
import { ProductManager } from './admin/ProductManager';
import { UserManager } from './admin/UserManager';
import { Analytics } from './admin/Analytics';

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const { user } = useStore();
    const [activeTab, setActiveTab] = useState<'products' | 'users' | 'analytics'>('products');

    if (!user?.isAdmin) {
        return null;
    }

    const tabs = [
        { id: 'products', label: 'PRODUCTS', icon: Package },
        { id: 'users', label: 'USERS', icon: Users },
        { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                    width: '95%',
                    maxWidth: '1400px',
                    height: '90vh',
                    background: '#0a0a0a',
                    border: '2px solid #ffe600',
                    boxShadow: '0 0 30px rgba(255, 230, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '2px solid #ffe600',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 230, 0, 0.05)'
                }}>
                    <h1 style={{
                        fontFamily: 'Orbitron',
                        color: '#ffe600',
                        fontSize: '1.8rem',
                        letterSpacing: '3px',
                        textShadow: '0 0 10px rgba(255, 230, 0, 0.5)'
                    }}>
                        ADMIN_CONTROL_PANEL
                    </h1>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ff0055',
                            color: '#ff0055',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '20px 30px',
                    borderBottom: '1px solid #333'
                }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    background: isActive ? 'rgba(255, 230, 0, 0.1)' : 'transparent',
                                    border: `1px solid ${isActive ? '#ffe600' : '#333'}`,
                                    color: isActive ? '#ffe600' : '#666',
                                    padding: '12px 20px',
                                    fontFamily: 'Orbitron',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                    letterSpacing: '1px'
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '30px'
                }}>
                    {activeTab === 'products' && <ProductManager />}
                    {activeTab === 'users' && <UserManager />}
                    {activeTab === 'analytics' && <Analytics />}
                </div>
            </motion.div>
        </div>
    );
};
