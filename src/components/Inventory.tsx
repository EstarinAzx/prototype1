import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { Shield, Box, Cpu, Crosshair, BoxSelect } from 'lucide-react';
import { type Item } from '../data/items';
import { Model3DViewer } from './Model3DViewer';

export const Inventory: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user, equipItem, unequipItem } = useStore();
    const [viewing3D, setViewing3D] = useState<Item | null>(null);

    if (!user) return null;

    const slots = [
        { id: 'primary', label: 'PRIMARY WEAPON', icon: Crosshair, type: 'weapon' },
        { id: 'secondary', label: 'SECONDARY WEAPON', icon: Crosshair, type: 'weapon' },
        { id: 'armor', label: 'ARMOR SYSTEM', icon: Shield, type: 'gear' },
        { id: 'implant', label: 'CYBERWARE', icon: Cpu, type: 'implant' },
        { id: 'gear', label: 'TACTICAL GEAR', icon: Box, type: 'gear' }
    ];

    const handleEquip = (item: Item) => {
        if (item.type === 'weapon') {
            if (!user.loadout.primary) equipItem(item, 'primary');
            else equipItem(item, 'secondary');
        } else if (item.type === 'implant') {
            equipItem(item, 'implant');
        } else if (item.type === 'gear') {
            if (item.name.includes('ARMOR') || item.name.includes('PLATE')) equipItem(item, 'armor');
            else equipItem(item, 'gear');
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="inventory-container"
                style={{
                    width: '90%',
                    maxWidth: '1200px',
                    height: '90%',
                    background: '#0a0a0a',
                    border: '1px solid #4ade80',
                    display: 'flex',
                    flexDirection: 'row',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(74, 222, 128, 0.2)'
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
                        color: '#ff0055',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontFamily: 'Orbitron'
                    }}
                >
                    ✕
                </button>

                {/* LEFT PANEL: LOADOUT */}
                <div className="loadout-panel" style={{
                    width: '40%',
                    padding: '40px',
                    borderRight: '1px solid #333',
                    background: 'rgba(0, 20, 40, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: '#ffe600', marginBottom: '20px', letterSpacing: '2px' }}>
                        ACTIVE LOADOUT
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {slots.map(slot => {
                            const equippedItem = user.loadout[slot.id as keyof typeof user.loadout];
                            const Icon = slot.icon;

                            return (
                                <div key={slot.id} style={{
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    border: `1px solid ${equippedItem ? '#4ade80' : '#333'}`,
                                    padding: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(74, 222, 128, 0.1)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: '#4ade80'
                                    }}>
                                        <Icon size={20} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'Orbitron' }}>
                                            {slot.label}
                                        </div>
                                        <div style={{
                                            color: equippedItem ? '#fff' : '#444',
                                            fontFamily: 'Rajdhani',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {equippedItem ? equippedItem.name : 'EMPTY SLOT'}
                                        </div>
                                    </div>

                                    {equippedItem && (
                                        <button
                                            onClick={() => unequipItem(slot.id as any)}
                                            style={{
                                                background: 'rgba(255, 0, 85, 0.2)',
                                                border: '1px solid #ff0055',
                                                color: '#ff0055',
                                                padding: '5px 10px',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                fontFamily: 'Orbitron'
                                            }}
                                        >
                                            UNEQUIP
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid #4ade80' }}>
                        <div style={{ fontFamily: 'Orbitron', color: '#4ade80', fontSize: '0.9rem', marginBottom: '10px' }}>
                            COMBAT STATS
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: '#aaa' }}>
                            <div>ATTACK POWER: <span style={{ color: '#fff' }}>--</span></div>
                            <div>DEFENSE: <span style={{ color: '#fff' }}>--</span></div>
                            <div>STEALTH: <span style={{ color: '#fff' }}>--</span></div>
                            <div>WEIGHT: <span style={{ color: '#fff' }}>--</span></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: INVENTORY */}
                <div className="inventory-panel" style={{
                    width: '60%',
                    padding: '40px',
                    overflowY: 'auto'
                }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: '#4ade80', marginBottom: '20px', letterSpacing: '2px' }}>
                        STORAGE // {user.inventory.length} ITEMS
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '15px'
                    }}>
                        {user.inventory.map((item, index) => (
                            <motion.div
                                key={`${item.id}-${index}`}
                                whileHover={{ scale: 1.05, borderColor: '#ffe600' }}
                                onClick={() => handleEquip(item)}
                                style={{
                                    background: 'rgba(20, 20, 20, 0.8)',
                                    border: '1px solid #333',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                                className={`rarity-${item.rarity}`}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '60%',
                                    backgroundImage: `url(${item.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    marginBottom: '10px',
                                    opacity: 0.8
                                }}></div>

                                <div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#fff',
                                        fontFamily: 'Rajdhani',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        marginBottom: '5px'
                                    }}>
                                        {item.name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '8px' }}>
                                        {item.type.toUpperCase()}
                                    </div>
                                    {item.modelPath && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewing3D(item);
                                            }}
                                            style={{
                                                background: 'rgba(74, 222, 128, 0.1)',
                                                border: '1px solid #4ade80',
                                                color: '#4ade80',
                                                padding: '4px 8px',
                                                fontSize: '0.65rem',
                                                fontFamily: 'Orbitron',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <BoxSelect size={12} />
                                            VIEW 3D
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {user.inventory.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            color: '#444',
                            marginTop: '100px',
                            fontFamily: 'Orbitron'
                        }}>
                            NO ITEMS IN STORAGE
                        </div>
                    )}
                </div>
            </motion.div>

            {/* 3D Model Viewer */}
            {viewing3D && viewing3D.modelPath && (
                <Model3DViewer
                    modelPath={viewing3D.modelPath}
                    itemName={viewing3D.name}
                    onClose={() => setViewing3D(null)}
                />
            )}
        </div>
    );
};
