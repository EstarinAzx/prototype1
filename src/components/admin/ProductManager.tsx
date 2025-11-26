import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Edit, Trash2, Plus, Upload, X, Loader } from 'lucide-react';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { type Item } from '../../data/items';

export const ProductManager: React.FC = () => {
    const { items, addProduct, deleteProduct, updateProduct } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Edit Mode State
    const [editingId, setEditingId] = useState<number | string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState('gear');
    const [rarity, setRarity] = useState('common');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setName('');
        setType('gear');
        setRarity('common');
        setPrice('');
        setImageFile(null);
        setImagePreview(null);
    };

    const handleEdit = (product: Item) => {
        setEditingId(product.id);
        setName(product.name);
        setType(product.type);
        setRarity(product.rarity);
        setPrice(product.price.toString());
        setImagePreview(product.image);
        setShowForm(true);
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price) return;

        setLoading(true);
        try {
            let imageUrl = imagePreview;

            // 1. Upload new image if selected
            if (imageFile) {
                const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            if (editingId) {
                // UPDATE EXISTING PRODUCT
                await updateProduct(editingId, {
                    name,
                    type: type as any,
                    rarity: rarity as any,
                    price: Number(price),
                    image: imageUrl || undefined
                });
            } else {
                // CREATE NEW PRODUCT
                if (!imageUrl) {
                    alert('Image is required for new products');
                    setLoading(false);
                    return;
                }
                await addProduct({
                    name,
                    type: type as any,
                    rarity: rarity as any,
                    price: Number(price),
                    image: imageUrl,
                    stats: {} // Default empty stats
                });
            }

            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h2 style={{
                    fontFamily: 'Orbitron',
                    color: '#00f3ff',
                    fontSize: '1.5rem'
                }}>
                    PRODUCT INVENTORY
                </h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    style={{
                        background: 'rgba(0, 243, 255, 0.1)',
                        border: '1px solid #00f3ff',
                        color: '#00f3ff',
                        padding: '10px 20px',
                        fontFamily: 'Orbitron',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={18} />
                    ADD NEW PRODUCT
                </button>
            </div>

            {/* Product Table */}
            <div style={{
                background: 'rgba(0, 243, 255, 0.05)',
                border: '1px solid #333',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '30px'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr style={{
                            background: 'rgba(0, 243, 255, 0.1)',
                            borderBottom: '1px solid #00f3ff'
                        }}>
                            <th style={tableHeaderStyle}>ID</th>
                            <th style={tableHeaderStyle}>IMAGE</th>
                            <th style={tableHeaderStyle}>NAME</th>
                            <th style={tableHeaderStyle}>TYPE</th>
                            <th style={tableHeaderStyle}>RARITY</th>
                            <th style={tableHeaderStyle}>PRICE</th>
                            <th style={tableHeaderStyle}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(product => (
                            <tr key={product.id} style={{
                                borderBottom: '1px solid #222',
                                transition: 'background 0.2s'
                            }}>
                                <td style={tableCellStyle}>{product.id.toString().slice(0, 8)}...</td>
                                <td style={tableCellStyle}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'cover',
                                            border: `1px solid ${getRarityColor(product.rarity)}`
                                        }}
                                    />
                                </td>
                                <td style={tableCellStyle}>{product.name}</td>
                                <td style={tableCellStyle}>
                                    <span style={{
                                        color: '#00f3ff',
                                        textTransform: 'uppercase',
                                        fontSize: '0.85rem'
                                    }}>
                                        {product.type}
                                    </span>
                                </td>
                                <td style={tableCellStyle}>
                                    <span style={{
                                        color: getRarityColor(product.rarity),
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        fontSize: '0.85rem'
                                    }}>
                                        {product.rarity}
                                    </span>
                                </td>
                                <td style={tableCellStyle}>
                                    <span style={{ color: '#ffe600', fontFamily: 'Orbitron' }}>
                                        ¥{product.price.toLocaleString()}
                                    </span>
                                </td>
                                <td style={tableCellStyle}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            style={actionButtonStyle('#00f3ff')}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            style={actionButtonStyle('#ff0055')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Product Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        width: '500px',
                        background: '#0a0a0a',
                        border: '1px solid #00f3ff',
                        padding: '30px',
                        boxShadow: '0 0 30px rgba(0, 243, 255, 0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                fontFamily: 'Orbitron',
                                color: '#00f3ff',
                                fontSize: '1.2rem'
                            }}>
                                {editingId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
                            </h3>
                            <button
                                onClick={resetForm}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Image Upload */}
                            <div style={{
                                border: '1px dashed #333',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                position: 'relative'
                            }}>
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Upload size={30} color="#666" />
                                )}
                                <span style={{ color: '#666', fontFamily: 'Orbitron' }}>
                                    {imagePreview ? 'Click to change' : 'Upload Product Image'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Product Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    <option value="weapon">WEAPON</option>
                                    <option value="implant">IMPLANT</option>
                                    <option value="gear">GEAR</option>
                                </select>

                                <select
                                    value={rarity}
                                    onChange={(e) => setRarity(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    <option value="common">COMMON</option>
                                    <option value="rare">RARE</option>
                                    <option value="epic">EPIC</option>
                                    <option value="legendary">LEGENDARY</option>
                                </select>
                            </div>

                            <input
                                type="number"
                                placeholder="Price (¥)"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                style={inputStyle}
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: '#00f3ff',
                                    border: 'none',
                                    color: '#000',
                                    padding: '12px',
                                    fontFamily: 'Orbitron',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'wait' : 'pointer',
                                    marginTop: '10px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                {loading ? <Loader className="spin" size={18} /> : (editingId ? <Edit size={18} /> : <Plus size={18} />)}
                                {loading ? 'SAVING...' : (editingId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const tableHeaderStyle: React.CSSProperties = {
    padding: '15px',
    textAlign: 'left',
    fontFamily: 'Orbitron',
    fontSize: '0.85rem',
    color: '#00f3ff',
    letterSpacing: '1px'
};

const tableCellStyle: React.CSSProperties = {
    padding: '15px',
    fontFamily: 'Orbitron',
    fontSize: '1rem',
    color: '#e0e0e0',
    verticalAlign: 'middle'
};

const actionButtonStyle = (color: string): React.CSSProperties => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    color,
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
});

const inputStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #333',
    color: '#fff',
    padding: '10px',
    fontFamily: 'Orbitron',
    fontSize: '1rem',
    outline: 'none'
};

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#ffd700';
        case 'epic': return '#a855f7';
        case 'rare': return '#3b82f6';
        default: return '#6b7280';
    }
};
