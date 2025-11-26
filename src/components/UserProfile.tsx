import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'framer-motion';
import { X, Edit2, Trophy, Star } from 'lucide-react';
import { avatars } from '../data/avatars';
import { achievements } from '../data/achievements';

interface UserProfileProps {
    onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
    const { user, updateProfile } = useStore();
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState(user?.profile.bio || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user?.profile.avatar || 'netrunner');

    if (!user) return null;

    const handleSaveProfile = async () => {
        await updateProfile(selectedAvatar, bioText);
        setIsEditingBio(false);
    };

    const daysSinceJoined = Math.floor((Date.now() - user.profile.joinedDate) / (1000 * 60 * 60 * 24));
    const currentAvatar = avatars.find(a => a.id === user.profile.avatar) || avatars[0];
    const xpProgress = (user.profile.xp % 1000) / 1000 * 100;

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
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    background: '#0a0a0a',
                    border: '2px solid #00f3ff',
                    boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '2px solid #00f3ff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0, 243, 255, 0.05)'
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
                            boxShadow: `0 0 20px ${currentAvatar.color}40`
                        }}>
                            {currentAvatar.icon}
                        </div>
                        <div>
                            <h1 style={{
                                fontFamily: 'Orbitron',
                                color: '#00f3ff',
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
                            color: '#00f3ff'
                        }}>
                            <span>EXPERIENCE</span>
                            <span>{user.profile.xp} XP</span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#222',
                            border: '1px solid #00f3ff',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${xpProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #00f3ff, #00ff00)',
                                boxShadow: '0 0 10px #00f3ff',
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
                        <StatCard label="ITEMS OWNED" value={user.inventory.length.toString()} color="#00f3ff" />
                        <StatCard label="TRANSACTIONS" value={(user as any).transactions?.length || 0} color="#ff0055" />
                        <StatCard label="DAYS ACTIVE" value={daysSinceJoined.toString()} color="#a855f7" />
                    </div>

                    {/* Avatar Selection */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{
                            fontFamily: 'Orbitron',
                            color: '#00f3ff',
                            fontSize: '1.2rem',
                            marginBottom: '15px'
                        }}>
                            SELECT AVATAR
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '10px'
                        }}>
                            {avatars.map(avatar => (
                                <button
                                    key={avatar.id}
                                    onClick={() => setSelectedAvatar(avatar.id)}
                                    style={{
                                        background: selectedAvatar === avatar.id ? `rgba(${hexToRgb(avatar.color)}, 0.2)` : 'rgba(0, 0, 0, 0.3)',
                                        border: `2px solid ${selectedAvatar === avatar.id ? avatar.color : '#333'}`,
                                        padding: '15px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem' }}>{avatar.icon}</div>
                                    <div style={{
                                        fontFamily: 'Orbitron',
                                        fontSize: '0.75rem',
                                        color: avatar.color
                                    }}>
                                        {avatar.name}
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
                                color: '#00f3ff',
                                fontSize: '1.2rem'
                            }}>
                                BIO
                            </h3>
                            {!isEditingBio && (
                                <button
                                    onClick={() => setIsEditingBio(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #00f3ff',
                                        color: '#00f3ff',
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
                                        background: 'rgba(0, 243, 255, 0.05)',
                                        border: '1px solid #00f3ff',
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
                                    gap: '10px',
                                    marginTop: '10px'
                                }}>
                                    <button
                                        onClick={handleSaveProfile}
                                        style={{
                                            background: '#00f3ff',
                                            border: 'none',
                                            color: '#000',
                                            padding: '8px 20px',
                                            fontFamily: 'Orbitron',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        SAVE
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingBio(false);
                                            setBioText(user.profile.bio);
                                            setSelectedAvatar(user.profile.avatar);
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
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(0, 243, 255, 0.05)',
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

                    {/* Achievements */}
                    <div>
                        <h3 style={{
                            fontFamily: 'Orbitron',
                            color: '#00f3ff',
                            fontSize: '1.2rem',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Trophy size={20} />
                            ACHIEVEMENTS ({user.profile.achievements.length}/{achievements.length})
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '15px'
                        }}>
                            {achievements.map(achievement => {
                                const isUnlocked = user.profile.achievements.includes(achievement.id);
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
        </div>
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
