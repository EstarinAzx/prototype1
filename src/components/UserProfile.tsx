import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';
import { X, Edit2, Trophy, Star, Upload } from 'lucide-react';
import { avatars } from '../data/avatars';
import { achievements } from '../data/achievements';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.warn('Image compression timed out, using original file');
            resolve(file);
        }, 10000);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            clearTimeout(timeout);
            resolve(file);
            return;
        }
        const img = new Image();
        img.onload = () => {
            try {
                clearTimeout(timeout);
                const maxWidth = 300;
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    0.7
                );
            } catch (err) {
                resolve(file);
            }
        };
        img.onerror = () => {
            clearTimeout(timeout);
            resolve(file);
        };
        img.src = URL.createObjectURL(file);
    });
};

interface UserProfileProps {
    onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
    const { user, updateProfile } = useStore();
    const { showNotification } = useNotification();
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState(user?.profile.bio || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.profile.avatar || 'netrunner');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!user) return null;

    const hasChanges =
        bioText !== user.profile.bio ||
        selectedAvatar !== user.profile.avatar ||
        selectedFile !== null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file', 'error');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }
            setSelectedFile(file);
            setUploadedAvatarUrl(URL.createObjectURL(file));
        }
    };

    const saveChanges = async () => {
        if (!user.uid) return;
        setIsSaving(true);
        try {
            let avatarUrl = user.profile.avatarUrl;
            if (selectedFile) {
                const compressedBlob = await compressImage(selectedFile);
                const storageRef = ref(storage, `avatars/${user.uid}`);
                await uploadBytes(storageRef, compressedBlob);
                avatarUrl = await getDownloadURL(storageRef);
            }
            const userDocRef = doc(db, 'users', user.uid);
            const updates: any = {
                'profile.bio': bioText,
                'profile.avatar': selectedAvatar
            };
            if (avatarUrl) {
                updates['profile.avatarUrl'] = avatarUrl;
            }
            await updateDoc(userDocRef, updates);
            await updateProfile(selectedAvatar, bioText, avatarUrl);
            setSelectedFile(null);
            setIsEditingBio(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showNotification(`Failed to update profile: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const daysSinceJoined = Math.floor((Date.now() - user.profile.joinedDate) / (1000 * 60 * 60 * 24));
    const currentAvatar = avatars.find(a => a.id === user.profile.avatar) || avatars[0];
    const xpProgress = (user.profile.xp % 1000) / 1000 * 100;

    const modalContent = (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(5,10,15,0.98) 100%)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.03) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    width: '95%',
                    maxWidth: '950px',
                    maxHeight: '90vh',
                    background: 'linear-gradient(180deg, rgba(8,12,18,0.98) 0%, rgba(5,8,12,0.99) 100%)',
                    border: '1px solid #00f0ff',
                    boxShadow: '0 0 60px rgba(0,240,255,0.2), 0 0 120px rgba(0,240,255,0.1), inset 0 1px 0 rgba(0,240,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    clipPath: 'polygon(0 0, calc(100% - 25px) 0, 100% 25px, 100% 100%, 25px 100%, 0 calc(100% - 25px))',
                    overflow: 'hidden'
                }}
            >
                {/* Animated scan line */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
                    animation: 'scan 3s linear infinite',
                    opacity: 0.5,
                    pointerEvents: 'none'
                }} />

                {/* Corner accents */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '80px', height: '3px', background: 'linear-gradient(90deg, #00f0ff, transparent)', boxShadow: '0 0 15px #00f0ff' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '80px', background: 'linear-gradient(180deg, #00f0ff, transparent)', boxShadow: '0 0 15px #00f0ff' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '3px', background: 'linear-gradient(270deg, #00f0ff, transparent)', boxShadow: '0 0 15px #00f0ff' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '3px', height: '80px', background: 'linear-gradient(0deg, #00f0ff, transparent)', boxShadow: '0 0 15px #00f0ff' }} />

                {/* Header */}
                <div style={{
                    padding: '25px 35px',
                    borderBottom: '1px solid rgba(0,240,255,0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(0,240,255,0.08) 0%, transparent 100%)',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            border: `3px solid ${currentAvatar.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3.5rem',
                            background: `radial-gradient(circle, rgba(${hexToRgb(currentAvatar.color)}, 0.2) 0%, transparent 70%)`,
                            boxShadow: `0 0 30px ${currentAvatar.color}50, inset 0 0 20px ${currentAvatar.color}20`,
                            backgroundImage: uploadedAvatarUrl || user.profile.avatarUrl ? `url(${uploadedAvatarUrl || user.profile.avatarUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative'
                        }}>
                            {!uploadedAvatarUrl && !user.profile.avatarUrl && currentAvatar.icon}
                            <div style={{
                                position: 'absolute',
                                inset: -3,
                                borderRadius: '50%',
                                border: `1px solid ${currentAvatar.color}`,
                                opacity: 0.3
                            }} />
                        </div>
                        <div>
                            <h1 style={{
                                fontFamily: 'Orbitron, sans-serif',
                                fontSize: '2rem',
                                color: '#00f0ff',
                                letterSpacing: '3px',
                                marginBottom: '8px',
                                textShadow: '0 0 20px rgba(0,240,255,0.5)'
                            }}>
                                {user.username.toUpperCase()}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    background: `linear-gradient(135deg, ${currentAvatar.color}, ${currentAvatar.color}aa)`,
                                    color: '#000',
                                    padding: '5px 15px',
                                    fontFamily: 'Orbitron, sans-serif',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'
                                }}>
                                    LVL {user.profile.level}
                                </span>
                                <span style={{ color: '#888', fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>
                                    {currentAvatar.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,0,85,0.1)',
                            border: '1px solid #ff0055',
                            color: '#ff0055',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,0,85,0.3)';
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,85,0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,0,85,0.1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '30px 35px' }}>
                    {/* XP Progress */}
                    <div style={{ marginBottom: '35px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.8rem',
                            color: '#00f0ff'
                        }}>
                            <span style={{ textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>EXPERIENCE POINTS</span>
                            <span>{user.profile.xp} / {(user.profile.level) * 1000} XP</span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '10px',
                            background: 'rgba(0,240,255,0.1)',
                            border: '1px solid rgba(0,240,255,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)'
                        }}>
                            <div style={{
                                width: `${xpProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #00f0ff, #00ff88)',
                                boxShadow: '0 0 20px #00f0ff, inset 0 0 10px rgba(255,255,255,0.3)',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '15px',
                        marginBottom: '35px'
                    }}>
                        <StatCard label="CREDITS" value={`¥${user.credits.toLocaleString()}`} color="#ffe600" />
                        <StatCard label="ITEMS OWNED" value={user.inventory.length.toString()} color="#00f0ff" />
                        <StatCard label="TRANSACTIONS" value={String((user as any).transactions?.length || 0)} color="#ff0055" />
                        <StatCard label="DAYS ACTIVE" value={daysSinceJoined.toString()} color="#a855f7" />
                    </div>

                    {/* Avatar Selection */}
                    <div style={{ marginBottom: '35px' }}>
                        <h3 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            color: '#00f0ff',
                            fontSize: '1rem',
                            marginBottom: '20px',
                            paddingBottom: '10px',
                            borderBottom: '1px solid rgba(0,240,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textShadow: '0 0 10px rgba(0,240,255,0.3)'
                        }}>
                            <span style={{ color: '#00f0ff' }}>◆</span> SELECT AVATAR
                        </h3>

                        {/* Upload Button */}
                        <label style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(0,240,255,0.05) 100%)',
                            border: '1px solid #00f0ff',
                            color: '#00f0ff',
                            padding: '12px 25px',
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            marginBottom: '20px',
                            transition: 'all 0.3s ease',
                            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(0,240,255,0.2)';
                            e.currentTarget.style.boxShadow = '0 0 25px rgba(0,240,255,0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(0,240,255,0.05) 100%)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <Upload size={16} />
                            UPLOAD CUSTOM AVATAR
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                        {selectedFile && (
                            <div style={{ marginTop: '-10px', marginBottom: '20px', fontFamily: 'Orbitron, sans-serif', color: '#00f0ff', fontSize: '0.9rem' }}>
                                ✓ Selected: {selectedFile.name}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                            {avatars.map(avatar => (
                                <button
                                    key={avatar.id}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    style={{
                                        padding: '18px 10px',
                                        background: selectedAvatar === avatar.id 
                                            ? `linear-gradient(135deg, rgba(${hexToRgb(avatar.color)}, 0.25) 0%, rgba(${hexToRgb(avatar.color)}, 0.1) 100%)`
                                            : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${selectedAvatar === avatar.id ? avatar.color : 'rgba(255,255,255,0.1)'}`,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        boxShadow: selectedAvatar === avatar.id ? `0 0 20px ${avatar.color}40, inset 0 0 15px ${avatar.color}10` : 'none'
                                    }}
                                    onMouseEnter={e => {
                                        if (selectedAvatar !== avatar.id) {
                                            e.currentTarget.style.borderColor = avatar.color;
                                            e.currentTarget.style.background = `rgba(${hexToRgb(avatar.color)}, 0.1)`;
                                            e.currentTarget.style.boxShadow = `0 0 15px ${avatar.color}30`;
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (selectedAvatar !== avatar.id) {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    <div style={{
                                        fontSize: '2.5rem',
                                        filter: selectedAvatar === avatar.id ? `drop-shadow(0 0 12px ${avatar.color})` : 'none',
                                        transition: 'all 0.3s'
                                    }}>
                                        {avatar.icon}
                                    </div>
                                    <div style={{
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontSize: '0.65rem',
                                        color: selectedAvatar === avatar.id ? avatar.color : '#666',
                                        letterSpacing: '0.5px',
                                        textShadow: selectedAvatar === avatar.id ? `0 0 10px ${avatar.color}` : 'none'
                                    }}>
                                        {avatar.name.toUpperCase()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div style={{ marginBottom: '35px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{
                                fontFamily: 'Orbitron, sans-serif',
                                color: '#00f0ff',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                textShadow: '0 0 10px rgba(0,240,255,0.3)'
                            }}>
                                <span style={{ color: '#00f0ff' }}>◆</span> BIO
                            </h3>
                            {!isEditingBio && (
                                <button
                                    onClick={() => setIsEditingBio(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #00f0ff',
                                        color: '#00f0ff',
                                        padding: '6px 15px',
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(0,240,255,0.1)';
                                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0,240,255,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <Edit2 size={12} />
                                    EDIT
                                </button>
                            )}
                        </div>
                        {isEditingBio ? (
                            <div>
                                <textarea
                                    value={bioText}
                                    onChange={(e) => setBioText(e.target.value)}
                                    maxLength={200}
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        background: 'rgba(0,240,255,0.05)',
                                        border: '1px solid rgba(0,240,255,0.3)',
                                        color: '#fff',
                                        padding: '15px',
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontSize: '1rem',
                                        resize: 'none',
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#00f0ff'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'}
                                    placeholder="Tell us about yourself..."
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button
                                        onClick={() => { setIsEditingBio(false); setBioText(user.profile.bio || ''); }}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #666',
                                            color: '#888',
                                            padding: '8px 20px',
                                            fontFamily: 'Orbitron, sans-serif',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        DONE
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(0,240,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '18px',
                                fontFamily: 'Orbitron, sans-serif',
                                fontSize: '1rem',
                                color: '#aaa',
                                minHeight: '60px'
                            }}>
                                {user.profile.bio || 'No bio set. Click EDIT to add one.'}
                            </div>
                        )}
                    </div>

                    {/* Save Changes Button */}
                    {hasChanges && (
                        <div style={{ marginBottom: '35px' }}>
                            <button
                                onClick={saveChanges}
                                disabled={isSaving}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #00f0ff 0%, #00cc88 100%)',
                                    border: 'none',
                                    color: '#000',
                                    padding: '18px',
                                    fontFamily: 'Orbitron, sans-serif',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '3px',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
                                    boxShadow: '0 0 40px rgba(0,240,255,0.4)',
                                    transition: 'all 0.3s ease',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                                onMouseEnter={e => {
                                    if (!isSaving) {
                                        e.currentTarget.style.boxShadow = '0 0 60px rgba(0,240,255,0.6)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = '0 0 40px rgba(0,240,255,0.4)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    )}

                    {/* Achievements */}
                    <div>
                        <h3 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            color: '#00f0ff',
                            fontSize: '1rem',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textShadow: '0 0 10px rgba(0,240,255,0.3)'
                        }}>
                            <Trophy size={18} />
                            ACHIEVEMENTS ({user.profile.achievements?.length || 0}/{achievements.length})
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {achievements.map(achievement => {
                                const isUnlocked = user.profile.achievements?.includes(achievement.id) || false;
                                const rarityColor = getRarityColor(achievement.rarity);

                                return (
                                    <div
                                        key={achievement.id}
                                        style={{
                                            padding: '18px',
                                            background: isUnlocked 
                                                ? `linear-gradient(135deg, rgba(${hexToRgb(rarityColor)}, 0.15) 0%, rgba(${hexToRgb(rarityColor)}, 0.05) 100%)`
                                                : 'rgba(0,0,0,0.3)',
                                            border: `1px solid ${isUnlocked ? rarityColor : 'rgba(255,255,255,0.1)'}`,
                                            opacity: isUnlocked ? 1 : 0.4,
                                            position: 'relative',
                                            transition: 'all 0.3s',
                                            boxShadow: isUnlocked ? `inset 0 0 20px ${rarityColor}10` : 'none'
                                        }}
                                    >
                                        {isUnlocked && (
                                            <div style={{ position: 'absolute', top: '12px', right: '12px', color: rarityColor }}>
                                                <Star size={14} fill={rarityColor} />
                                            </div>
                                        )}
                                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{achievement.icon}</div>
                                        <div style={{
                                            fontFamily: 'Orbitron, sans-serif',
                                            fontSize: '0.8rem',
                                            color: rarityColor,
                                            marginBottom: '5px',
                                            textShadow: isUnlocked ? `0 0 10px ${rarityColor}50` : 'none'
                                        }}>
                                            {achievement.name}
                                        </div>
                                        <div style={{
                                            fontFamily: 'Orbitron, sans-serif',
                                            fontSize: '0.8rem',
                                            color: '#777'
                                        }}>
                                            {achievement.description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

interface StatCardProps {
    label: string;
    value: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
    return (
        <div style={{
            padding: '20px',
            background: `linear-gradient(135deg, rgba(${hexToRgb(color)}, 0.1) 0%, rgba(${hexToRgb(color)}, 0.03) 100%)`,
            border: `1px solid ${color}`,
            position: 'relative',
            overflow: 'hidden',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '30px',
                height: '2px',
                background: color,
                boxShadow: `0 0 10px ${color}`
            }} />
            <span style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: color,
                textShadow: `0 0 20px ${color}50`
            }}>
                {value}
            </span>
        </div>
    );
};

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
};

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#ffd700';
        case 'epic': return '#a855f7';
        case 'rare': return '#3b82f6';
        default: return '#6b7280';
    }
};
