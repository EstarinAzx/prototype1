import React, { useState } from 'react';
import { CustomSelect } from './CustomSelect';
import { useStore } from '../context/StoreContext';
import { ProductGrid } from './ProductGrid';
import { CartSidebar } from './CartSidebar';
import { TransactionHistory } from './TransactionHistory';
import { Inventory } from './Inventory';
import { AdminDashboard } from './AdminDashboard';
import { UserProfile } from './UserProfile';
import { Search, Receipt, Package, ShoppingCart, Shield, User } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export const Layout: React.FC = () => {
    const {
        credits,
        user,
        logout,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        setSortBy
    } = useStore();

    const [showHistory, setShowHistory] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const categories = ['all', 'weapon', 'implant', 'gear'];

    return (
        <div className="app-container">
            <div className="crt-overlay"></div>
            <div className="scanline"></div>

            <header className="cyber-header">
                <div className="brand">
                    <span className="glitch" data-text="CYBER_MARKET">CYBER_MARKET</span>
                    <span className="version">SYS.VER.3.0.REACT</span>
                </div>

                <div className="search-bar" style={{ flex: 1, margin: '0 20px', position: 'relative', maxWidth: '500px' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4ade80' }} size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(74, 222, 128, 0.1)',
                            border: '1px solid #4ade80',
                            padding: '10px 10px 10px 40px',
                            color: '#fff',
                            fontFamily: 'Orbitron',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                {/* Mobile Cart Toggle */}
                <button
                    className="mobile-cart-toggle"
                    onClick={() => setShowCart(true)}
                    style={{
                        display: 'none',
                        background: 'transparent',
                        border: '1px solid var(--neon-pink)',
                        color: 'var(--neon-pink)',
                        padding: '8px',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <ShoppingCart size={20} />
                    {useStore().cart.length > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: 'var(--neon-pink)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontFamily: 'Orbitron'
                        }}>
                            {useStore().cart.length}
                        </span>
                    )}
                </button>

                <div className="user-stats">
                    {user?.isAdmin && (
                        <button
                            onClick={() => setShowAdmin(true)}
                            style={{
                                background: 'transparent',
                                border: '1px solid #ffe600',
                                color: '#ffe600',
                                padding: '8px 15px',
                                fontFamily: 'Orbitron',
                                cursor: 'pointer',
                                marginRight: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Shield size={16} />
                            ADMIN
                        </button>
                    )}
                    <button
                        onClick={() => setShowInventory(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #4ade80',
                            color: '#4ade80',
                            padding: '8px 15px',
                            fontFamily: 'Orbitron',
                            cursor: 'pointer',
                            marginRight: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Package size={16} />
                        INVENTORY
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ffe600',
                            color: '#ffe600',
                            padding: '8px 15px',
                            fontFamily: 'Orbitron',
                            cursor: 'pointer',
                            marginRight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Receipt size={16} />
                        HISTORY
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="stat-item"
                        style={{
                            marginRight: '20px',
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start'
                        }}
                    >
                        <span className="label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={12} />
                            OPERATOR
                        </span>
                        <span className="value" style={{ color: '#4ade80' }}>{user?.username.toUpperCase()}</span>
                    </button>
                    <div className="stat-item">
                        <span className="label">CREDITS</span>
                        <span className="value" id="credits-display">¥ {credits.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ff0055',
                            color: '#ff0055',
                            padding: '5px 15px',
                            fontFamily: 'Orbitron',
                            cursor: 'pointer',
                            marginLeft: '20px'
                        }}
                    >
                        DISCONNECT
                    </button>
                </div>
            </header>

            <div className="main-layout">
                <nav className="cyber-nav">
                    <ul id="category-list">
                        {categories.map(cat => (
                            <li
                                key={cat}
                                className={`nav-item ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat.toUpperCase()}
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '20px' }}>
                        <div style={{ color: '#666', marginBottom: '10px', fontSize: '0.8rem' }}>SORT BY</div>
                        <CustomSelect
                            options={[
                                { value: '', label: 'DEFAULT' },
                                { value: 'price-asc', label: 'PRICE: LOW TO HIGH' },
                                { value: 'price-desc', label: 'PRICE: HIGH TO LOW' },
                                { value: 'name', label: 'NAME' }
                            ]}
                            value={useStore().sortBy || ''}
                            onChange={(value) => setSortBy(value as any)}
                        />
                    </div>

                    <div className="nav-decoration">
                        <div className="deco-line"></div>
                        <div className="deco-box"></div>
                    </div>
                </nav>

                <ProductGrid />
                <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
            </div>

            <TransactionHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
            <AnimatePresence>
                {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
                {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
                {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
            </AnimatePresence>
        </div>
    );
};
