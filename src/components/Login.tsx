// ============================================
// IMPORTS
// ============================================
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'framer-motion';

// ============================================
// LOGIN COMPONENT
// ============================================
// Purpose: Authentication screen for user login and signup
// Features:
// - Toggle between login/signup modes
// - Client-side validation
// - Firebase authentication integration
// - Animated error notifications
// - Cyberpunk-themed UI
// ============================================

export const Login: React.FC = () => {
    // ============================================
    // CONTEXT HOOKS
    // ============================================
    // Get authentication functions from StoreContext
    const { login, signup } = useStore();
    // Get notification function to show toast messages
    const { showNotification } = useNotification();

    // ============================================
    // LOCAL STATE
    // ============================================
    // Toggle between login (true) and signup (false) mode
    const [isLogin, setIsLogin] = useState(true);
    // User input for username/email
    const [username, setUsername] = useState('');
    // User input for password
    const [password, setPassword] = useState('');
    // Client-side validation error messages
    const [error, setError] = useState('');

    // ============================================
    // FORM SUBMISSION HANDLER
    // ============================================
    // Handles both login and signup flows
    // Validates inputs before calling Firebase Auth
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        // ============================================
        // VALIDATION
        // ============================================
        // Check if username is provided
        if (!username.trim()) {
            setError('IDENTITY REQUIRED');
            return;
        }

        // Check if password is provided
        if (!password.trim()) {
            setError('ACCESS CODE REQUIRED');
            return;
        }

        // ============================================
        // AUTHENTICATION FLOW
        // ============================================
        if (isLogin) {
            // LOGIN PATH: Existing user authentication
            const result = await login(username, password);
            if (!result.success) {
                showNotification(result.message, 'error');
            } else {
                showNotification(result.message, 'success');
            }
        } else {
            // SIGNUP PATH: New user registration
            const result = await signup(username, password);
            if (!result.success) {
                showNotification(result.message, 'error');
            } else {
                showNotification(result.message, 'success');
            }
        }
    };

    // ============================================
    // RENDER / UI
    // ============================================
    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1520 50%, #0a0a0f 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background grid effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                pointerEvents: 'none'
            }} />
            
            {/* Radial glow */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* ============================================
                ANIMATED LOGIN FORM CONTAINER
                ============================================ */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: 'rgba(10, 10, 10, 0.95)',
                    border: '2px solid #00f0ff',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '450px',
                    position: 'relative',
                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
                    boxShadow: '0 0 40px rgba(0,240,255,0.2), inset 0 0 20px rgba(0,240,255,0.05)',
                    zIndex: 1
                }}
            >
                {/* ============================================
                    HEADER SECTION
                    ============================================ */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    {/* Brand title with glitch effect */}
                    <h1 className="glitch" data-text="CYBER_MARKET" style={{
                        fontFamily: 'Orbitron',
                        color: '#00f3ff',
                        fontSize: '2.5rem',
                        marginBottom: '10px'
                    }}>CYBER_MARKET</h1>
                    {/* Authentication status text */}
                    <div style={{ color: '#ff0055', letterSpacing: '3px' }}>AUTHENTICATION REQUIRED</div>
                </div>

                {/* ============================================
                    AUTHENTICATION FORM
                    ============================================ */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* ============================================
                        USERNAME INPUT FIELD
                        ============================================ */}
                    <div>
                        <label style={{ display: 'block', color: '#ffe600', marginBottom: '5px', fontFamily: 'Orbitron' }}>
                            NETRUNNER_ID
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 243, 255, 0.1)',
                                border: '1px solid #333',
                                padding: '15px',
                                color: '#fff',
                                fontFamily: 'Orbitron',
                                fontSize: '1.2rem',
                                outline: 'none'
                            }}
                            placeholder="ENTER ALIAS..."
                        />
                    </div>

                    {/* ============================================
                        PASSWORD INPUT FIELD
                        ============================================ */}
                    <div>
                        <label style={{ display: 'block', color: '#ffe600', marginBottom: '5px', fontFamily: 'Orbitron' }}>
                            ACCESS_CODE
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 243, 255, 0.1)',
                                border: '1px solid #333',
                                padding: '15px',
                                color: '#fff',
                                fontFamily: 'Orbitron',
                                fontSize: '1.2rem',
                                outline: 'none'
                            }}
                            placeholder="ENTER PASSPHRASE..."
                        />
                    </div>

                    {/* ============================================
                        ERROR MESSAGE DISPLAY
                        Shows validation errors with cyberpunk styling
                        ============================================ */}
                    {error && (
                        <div style={{
                            color: '#ff0055',
                            background: 'rgba(255, 0, 85, 0.1)',
                            padding: '10px',
                            borderLeft: '3px solid #ff0055',
                            fontFamily: 'Orbitron',
                            fontSize: '0.9rem'
                        }}>
                            ⚠ {error}
                        </div>
                    )}

                    {/* ============================================
                        SUBMIT BUTTON
                        Text changes based on login/signup mode
                        ============================================ */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            marginTop: '10px',
                            padding: '15px',
                            background: 'linear-gradient(180deg, #00f0ff 0%, #0099aa 100%)',
                            border: 'none',
                            color: '#000',
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 700,
                            letterSpacing: '3px',
                            cursor: 'pointer',
                            clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                            transition: 'all 0.3s',
                            boxShadow: '0 0 20px rgba(0,240,255,0.3)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(0,240,255,0.5)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.3)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {isLogin ? 'ESTABLISH LINK' : 'INITIALIZE NEW ID'}
                    </button>
                </form>

                {/* ============================================
                    MODE TOGGLE SECTION
                    Switch between Login and Signup modes
                    ============================================ */}
                <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);  // Toggle mode
                            setError('');          // Clear any errors
                            setPassword('');       // Clear password for security
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#00f3ff',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontFamily: 'Orbitron',
                            fontSize: '1rem'
                        }}
                    >
                        {/* Toggle button text based on current mode */}
                        {isLogin ? 'NO ID? REGISTER NEW LINK' : 'ALREADY REGISTERED? LOGIN'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
