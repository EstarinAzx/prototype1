import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NotificationToast } from '../components/NotificationToast';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none' // Allow clicking through the container
            }}>
                <AnimatePresence>
                    {notifications.map(notification => (
                        <NotificationToast
                            key={notification.id}
                            notification={notification}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
