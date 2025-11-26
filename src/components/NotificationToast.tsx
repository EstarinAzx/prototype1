import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { type Notification } from '../context/NotificationContext';

interface NotificationToastProps {
    notification: Notification;
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const { message, type } = notification;

    const styles = {
        success: {
            border: '1px solid #00ff00',
            background: 'rgba(0, 20, 0, 0.9)',
            color: '#00ff00',
            icon: CheckCircle
        },
        error: {
            border: '1px solid #f59e0b',
            background: 'rgba(20, 0, 5, 0.9)',
            color: '#f59e0b',
            icon: AlertTriangle
        },
        info: {
            border: '1px solid #4ade80',
            background: 'rgba(0, 20, 40, 0.9)',
            color: '#4ade80',
            icon: Info
        }
    };

    const currentStyle = styles[type];
    const Icon = currentStyle.icon;

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
                minWidth: '300px',
                maxWidth: '400px',
                padding: '15px',
                background: currentStyle.background,
                border: currentStyle.border,
                boxShadow: `0 0 15px ${currentStyle.color}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                pointerEvents: 'auto', // Re-enable pointer events for the toast itself
                backdropFilter: 'blur(5px)',
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
            }}
        >
            <Icon size={20} color={currentStyle.color} />

            <div style={{ flex: 1 }}>
                <div style={{
                    fontFamily: 'Orbitron',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    marginBottom: '2px',
                    color: currentStyle.color
                }}>
                    SYSTEM_MSG // {type.toUpperCase()}
                </div>
                <div style={{
                    fontFamily: 'Rajdhani',
                    fontSize: '1rem',
                    color: '#fff',
                    lineHeight: '1.2'
                }}>
                    {message}
                </div>
            </div>

            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <X size={16} />
            </button>

            {/* Decorative corner accent */}
            <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '10px',
                height: '10px',
                background: currentStyle.color,
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
            }} />
        </motion.div>
    );
};
