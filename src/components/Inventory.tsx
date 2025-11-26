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

    // Group identical items for display
    const groupedInventory = React.useMemo(() => {
        if (!user) return [];
        const grouped = new Map<string, { item: Item; count: number }>();
        
        user.inventory.forEach(item => {
            const existing = grouped.get(String(item.id));
            if (existing) {
                existing.count++;
            } else {
                grouped.set(String(item.id), { item, count: 1 });
            }
        });
        
        return Array.from(grouped.values());
    }, [user?.inventory]);

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
                    background: 'linear-gradient(135deg, #0d0d0f 0%, #12141a 100%)',
                    border: '1px solid #00f0ff',
                    display: 'flex',
                    flexDirection: 'row',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '25px',
                        background: 'rgba(255, 0, 60, 0.1)',
                        border: '1px solid #ff003c',
                        color: '#ff003c',
                        fontSize: '16px',
                        padding: '8px 12px',
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
                    padding: '30px',
                    borderRight: '1px solid rgba(0, 240, 255, 0.2)',
                    background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.03) 0%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: '#00f0ff', marginBottom: '15px', letterSpacing: '3px', fontSize: '1.1rem', textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}>
                        ACTIVE LOADOUT
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {slots.map(slot => {
                            const equippedItem = user.loadout[slot.id as keyof typeof user.loadout];
                            const Icon = slot.icon;

                            return (
                                <div key={slot.id} style={{
                                    background: equippedItem ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 0, 0, 0.4)',
                                    border: `1px solid ${equippedItem ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        width: '35px',
                                        height: '35px',
                                        background: 'rgba(0, 240, 255, 0.1)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: '#00f0ff'
                                    }}>
                                        <Icon size={18} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.6rem', color: '#5a5a6a', fontFamily: 'Orbitron', letterSpacing: '1px' }}>
                                            {slot.label}
                                        </div>
                                        <div style={{
                                            color: equippedItem ? '#fff' : '#3a3a4a',
                                            fontFamily: 'Orbitron',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {equippedItem ? equippedItem.name : 'EMPTY SLOT'}
                                        </div>
                                    </div>

                                    {equippedItem && (
                                        <button
                                            onClick={() => unequipItem(slot.id as any)}
                                            style={{
                                                background: 'rgba(255, 0, 60, 0.2)',
                                                border: '1px solid #ff003c',
                                                color: '#ff003c',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontSize: '0.6rem',
                                                fontFamily: 'Orbitron',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            UNEQUIP
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                        <div style={{ fontFamily: 'Orbitron', color: '#ff003c', fontSize: '0.75rem', marginBottom: '10px', letterSpacing: '2px' }}>
                            COMBAT STATS
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.7rem', color: '#5a5a6a' }}>
                            <div>ATTACK: <span style={{ color: '#00f0ff' }}>--</span></div>
                            <div>DEFENSE: <span style={{ color: '#00f0ff' }}>--</span></div>
                            <div>STEALTH: <span style={{ color: '#00f0ff' }}>--</span></div>
                            <div>WEIGHT: <span style={{ color: '#00f0ff' }}>--</span></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: INVENTORY */}
                <div className="inventory-panel" style={{
                    width: '60%',
                    padding: '30px',
                    overflowY: 'auto',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <h2 style={{ fontFamily: 'Orbitron', color: '#00f0ff', marginBottom: '15px', letterSpacing: '3px', fontSize: '1rem' }}>
                        STORAGE <span style={{ color: '#fcee0a' }}>// {user.inventory.length} ITEMS</span>
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '12px'
                    }}>
                        {groupedInventory.map(({ item, count }) => (
                            <motion.div
                                key={`inv-item-${item.id}`}
                                whileHover={{ scale: 1.03, borderColor: '#00f0ff' }}
                                onClick={() => {
                                    if (item.type === 'weapon') {
                                        if (!user.loadout.primary) equipItem(item, 'primary');
                                        else equipItem(item, 'secondary');
                                    } else if (item.type === 'implant') {
                                        equipItem(item, 'implant');
                                    } else if (item.type === 'gear') {
                                        if (item.name.includes('ARMOR') || item.name.includes('PLATE')) equipItem(item, 'armor');
                                        else equipItem(item, 'gear');
                                    }
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.9) 0%, rgba(15, 18, 25, 0.8) 100%)',
                                    border: '1px solid rgba(0, 240, 255, 0.2)',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                                className={`rarity-${item.rarity}`}
                            >
                                {/* Quantity Badge */}
                                {count > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        background: '#fcee0a',
                                        color: '#000',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        padding: '2px 6px',
                                        borderRadius: '2px',
                                        zIndex: 5,
                                        fontFamily: 'Orbitron'
                                    }}>
                                        x{count}
                                    </div>
                                )}

                                <div style={{
                                    width: '100%',
                                    height: '55%',
                                    backgroundImage: `url(${item.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    marginBottom: '8px',
                                    opacity: 0.75
                                }}></div>

                                <div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: '#00f0ff',
                                        fontFamily: 'Orbitron',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        marginBottom: '3px'
                                    }}>
                                        {item.name}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: '#5a5a6a', marginBottom: '6px', letterSpacing: '1px' }}>
                                        {item.type.toUpperCase()}
                                    </div>
                                    {item.modelPath && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewing3D(item);
                                            }}
                                            style={{
                                                background: 'rgba(0, 240, 255, 0.1)',
                                                border: '1px solid #00f0ff',
                                                color: '#00f0ff',
                                                padding: '3px 6px',
                                                fontSize: '0.55rem',
                                                fontFamily: 'Orbitron',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                width: '100%',
                                                justifyContent: 'center',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            <BoxSelect size={10} />
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
                            color: '#5a5a6a',
                            marginTop: '80px',
                            fontFamily: 'Orbitron',
                            fontSize: '0.85rem',
                            letterSpacing: '2px'
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
