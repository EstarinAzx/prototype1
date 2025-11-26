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

    // Track if any changes have been made
    const hasChanges = 
        bioText !== user.profile.bio || 
        selectedAvatar !== user.profile.avatar || 
        selectedFile !== null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file', 'error');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }
            setSelectedFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setUploadedAvatarUrl(previewUrl);
        }
    };

    const saveChanges = async () => {
        if (!user.uid) return;
        
        setIsSaving(true);
        try {
            let avatarUrl = user.profile.avatarUrl;

            // Upload file to Firebase Storage if a new file was selected
            if (selectedFile) {
                const storageRef = ref(storage, `avatars/${user.uid}`);
                await uploadBytes(storageRef, selectedFile);
                avatarUrl = await getDownloadURL(storageRef);
            }

            // Update Firestore profile
            const userDocRef = doc(db, 'users', user.uid);
            const updates: any = {
                'profile.bio': bioText,
                'profile.avatar': selectedAvatar
            };
            if (avatarUrl) {
                updates['profile.avatarUrl'] = avatarUrl;
            }

            await updateDoc(userDocRef, updates);

            // Update local state
            await updateProfile(selectedAvatar, bioText, avatarUrl);
            
            // Reset state
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

    return createPortal(
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
                    maxWidth: '900px',
                    maxHeight: '90%',
                    background: 'rgba(10, 10, 10, 0.95)',
                    border: '1px solid #4ade80',
                    boxShadow: '0 0 50px rgba(74, 222, 128, 0.15), inset 0 0 20px rgba(74, 222, 128, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative Corner Lines */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '2px', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100px', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100px', height: '2px', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '2px', height: '100px', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
                {/* Header */}
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '2px solid #4ade80',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(74, 222, 128, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            border: `3px solid ${currentAvatar.color}`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            background: `rgba(${hexToRgb(currentAvatar.color)}, 0.1)`,
                            boxShadow: `0 0 20px ${currentAvatar.color}40`,
                            backgroundImage: uploadedAvatarUrl || user.profile.avatarUrl ? `url(${uploadedAvatarUrl || user.profile.avatarUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            {!uploadedAvatarUrl && !user.profile.avatarUrl && currentAvatar.icon}
                        </div>
                        <div>
                            <h1 style={{
                                fontFamily: 'Orbitron',
                                color: '#4ade80',
                                fontSize: '1.8rem',
                                letterSpacing: '2px',
                                marginBottom: '5px'
                            }}>
                                {user.username.toUpperCase()}
                            </h1>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{
                                    background: currentAvatar.color,
                                    color: '#000',
                                    padding: '4px 12px',
                                    fontFamily: 'Orbitron',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    LVL {user.profile.level}
                                </span>
                                <span style={{
                                    color: '#666',
                                    fontFamily: 'Rajdhani',
                                    fontSize: '0.9rem'
                                }}>
                                    {currentAvatar.name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ff0055',
                            color: '#ff0055',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '30px'
                }}>
                    {/* XP Progress */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontFamily: 'Orbitron',
                            fontSize: '0.85rem',
                            color: '#4ade80'
                        }}>
                            <span>EXPERIENCE</span>
                            <span>{user.profile.xp} XP</span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#222',
                            border: '1px solid #4ade80',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${xpProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #4ade80, #00ff00)',
                                boxShadow: '0 0 10px #4ade80',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '30px'
                    }}>
                        <StatCard label="CREDITS" value={`¥${user.credits.toLocaleString()}`} color="#ffe600" />
                        <StatCard label="ITEMS OWNED" value={user.inventory.length.toString()} color="#4ade80" />
                        <StatCard label="TRANSACTIONS" value={(user as any).transactions?.length || 0} color="#ff0055" />
                        <StatCard label="DAYS ACTIVE" value={daysSinceJoined.toString()} color="#a855f7" />
                    </div>

                    {/* Avatar Selection */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{
                            fontFamily: 'Orbitron',
                            color: '#4ade80',
                            fontSize: '1.2rem',
                            marginBottom: '15px',
                            borderBottom: '1px solid rgba(74, 222, 128, 0.3)',
                            paddingBottom: '10px'
                        }}>
                            SELECT AVATAR
                        </h3>
                        
                        {/* File Upload Section */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'inline-flex',
                                background: 'rgba(74, 222, 128, 0.1)',
                                border: '1px solid #4ade80',
                                color: '#4ade80',
                                padding: '12px 24px',
                                fontFamily: 'Orbitron',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                                transition: 'all 0.3s ease',
                                alignItems: 'center',
                                gap: '10px',
                                width: 'fit-content'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(74, 222, 128, 0.2)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(74, 222, 128, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(74, 222, 128, 0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                                <Upload size={18} />
                                UPLOAD CUSTOM AVATAR
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {selectedFile && (
                                <div style={{
                                    marginTop: '10px',
                                    fontFamily: 'Rajdhani',
                                    fontSize: '0.9rem',
                                    color: '#4ade80'
                                }}>
                                    Selected: {selectedFile.name}
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                            gap: '15px'
                        }}>
                            {avatars.map(avatar => (
                                <button
                                    key={avatar.id}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    style={{
                                        background: selectedAvatar === avatar.id ? `rgba(${hexToRgb(avatar.color)}, 0.15)` : 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${selectedAvatar === avatar.id ? avatar.color : 'rgba(255, 255, 255, 0.1)'}`,
                                        padding: '15px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = avatar.color;
                                        e.currentTarget.style.background = `rgba(${hexToRgb(avatar.color)}, 0.1)`;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedAvatar !== avatar.id) {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        }
                                    }}
                                >
                                    <div style={{
                                        fontSize: '2.2rem',
                                        filter: selectedAvatar === avatar.id ? `drop-shadow(0 0 10px ${avatar.color})` : 'none',
                                        transition: 'all 0.3s'
                                    }}>
                                        {avatar.icon}
                                    </div>
                                    <div style={{
                                        fontFamily: 'Orbitron',
                                        fontSize: '0.7rem',
                                        color: selectedAvatar === avatar.id ? avatar.color : '#888',
                                        letterSpacing: '1px'
                                    }}>
                                        {avatar.name.toUpperCase()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <h3 style={{
                                fontFamily: 'Orbitron',
                                color: '#4ade80',
                                fontSize: '1.2rem'
                            }}>
                                BIO
                            </h3>
                            {!isEditingBio && (
                                <button
                                    onClick={() => setIsEditingBio(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #4ade80',
                                        color: '#4ade80',
                                        padding: '6px 12px',
                                        fontFamily: 'Orbitron',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Edit2 size={14} />
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
                                        background: 'rgba(74, 222, 128, 0.05)',
                                        border: '1px solid #4ade80',
                                        color: '#fff',
                                        padding: '10px',
                                        fontFamily: 'Rajdhani',
                                        fontSize: '1rem',
                                        resize: 'none'
                                    }}
                                    placeholder="Tell us about yourself..."
                                />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '10px'
                                }}>
                                    <button
                                        onClick={() => {
                                            setIsEditingBio(false);
                                            setBioText(user.profile.bio || '');
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #666',
                                            color: '#666',
                                            padding: '8px 20px',
                                            fontFamily: 'Orbitron',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        DONE
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(74, 222, 128, 0.05)',
                                border: '1px solid #333',
                                padding: '15px',
                                fontFamily: 'Rajdhani',
                                fontSize: '1rem',
                                color: '#e0e0e0',
                                minHeight: '60px'
                            }}>
                                {user.profile.bio || 'No bio set. Click EDIT to add one.'}
                            </div>
                        )}
                    </div>

                    {/* Save Changes Button */}
                    {hasChanges && (
                        <div style={{ marginBottom: '30px' }}>
                            <button
                                onClick={saveChanges}
                                disabled={isSaving}
                                style={{
                                    background: '#4ade80',
                                    border: 'none',
                                    color: '#000',
                                    padding: '15px 40px',
                                    fontFamily: 'Orbitron',
                                    fontSize: '1rem',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
                                    boxShadow: '0 0 30px rgba(74, 222, 128, 0.5)',
                                    transition: 'all 0.3s ease',
                                    fontWeight: 'bold',
                                    letterSpacing: '2px',
                                    opacity: isSaving ? 0.6 : 1,
                                    width: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSaving) {
                                        e.currentTarget.style.boxShadow = '0 0 50px rgba(74, 222, 128, 0.8)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSaving) {
                                        e.currentTarget.style.boxShadow = '0 0 30px rgba(74, 222, 128, 0.5)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    )}

                    {/* Achievements */}
                    <div>
                        <h3 style={{
                            fontFamily: 'Orbitron',
                            color: '#4ade80',
                            fontSize: '1.2rem',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Trophy size={20} />
                            ACHIEVEMENTS ({user.profile.achievements?.length || 0}/{achievements.length})
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '15px'
                        }}>
                            {achievements.map(achievement => {
                                const isUnlocked = user.profile.achievements?.includes(achievement.id) || false;
                                const rarityColor = getRarityColor(achievement.rarity);

                                return (
                                    <div
                                        key={achievement.id}
                                        style={{
                                            background: isUnlocked ? `rgba(${hexToRgb(rarityColor)}, 0.1)` : 'rgba(0, 0, 0, 0.3)',
                                            border: `1px solid ${isUnlocked ? rarityColor : '#333'}`,
                                            padding: '15px',
                                            opacity: isUnlocked ? 1 : 0.5,
                                            position: 'relative'
                                        }}
                                    >
                                        {isUnlocked && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                color: rarityColor
                                            }}>
                                                <Star size={16} fill={rarityColor} />
                                            </div>
                                        )}
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                                            {achievement.icon}
                                        </div>
                                        <div style={{
                                            fontFamily: 'Orbitron',
                                            fontSize: '0.9rem',
                                            color: rarityColor,
                                            marginBottom: '5px'
                                        }}>
                                            {achievement.name}
                                        </div>
                                        <div style={{
                                            fontFamily: 'Rajdhani',
                                            fontSize: '0.85rem',
                                            color: '#999'
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
        </div>,
        document.body
    );
};

interface StatCardProps {
    label: string;
    value: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
    return (
        <div style={{
            background: `rgba(${hexToRgb(color)}, 0.05)`,
            border: `1px solid ${color}`,
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        }}>
            <span style={{
                fontFamily: 'Orbitron',
                fontSize: '0.75rem',
                color: '#666',
                letterSpacing: '1px'
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: 'Orbitron',
                fontSize: '1.5rem',
                color,
                fontWeight: 'bold'
            }}>
                {value}
            </span>
        </div>
    );
};

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
};

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#ffd700';
        case 'epic': return '#a855f7';
        case 'rare': return '#3b82f6';
        default: return '#6b7280';
    }
};
