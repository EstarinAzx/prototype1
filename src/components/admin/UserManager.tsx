import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search } from 'lucide-react';

interface UserData {
    uid: string;
    username: string;
    credits: number;
    isAdmin: boolean;
    createdAt: number;
    inventory?: any[];
}

export const UserManager: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData: UserData[] = [];
            usersSnapshot.forEach(doc => {
                usersData.push({ uid: doc.id, ...doc.data() } as UserData);
            });
            setUsers(usersData.sort((a, b) => b.createdAt - a.createdAt));
            setLoading(false);
        } catch (error) {
            console.error('Error loading users:', error);
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    USER DATABASE
                </h2>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#00f3ff'
                    }} size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH USERS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(0, 243, 255, 0.1)',
                            border: '1px solid #00f3ff',
                            padding: '10px 10px 10px 40px',
                            color: '#fff',
                            fontFamily: 'Orbitron',
                            fontSize: '0.85rem'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    color: '#666',
                    fontFamily: 'Orbitron'
                }}>
                    LOADING USER DATA...
                </div>
            ) : (
                <div style={{
                    background: 'rgba(0, 243, 255, 0.05)',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    overflow: 'hidden'
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
                                <th style={tableHeaderStyle}>USERNAME</th>
                                <th style={tableHeaderStyle}>CREDITS</th>
                                <th style={tableHeaderStyle}>INVENTORY</th>
                                <th style={tableHeaderStyle}>ROLE</th>
                                <th style={tableHeaderStyle}>JOINED</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.uid} style={{
                                    borderBottom: '1px solid #222'
                                }}>
                                    <td style={tableCellStyle}>
                                        <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>
                                            {user.username}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <span style={{ color: '#ffe600', fontFamily: 'Orbitron' }}>
                                            ¥{user.credits.toLocaleString()}
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        {user.inventory?.length || 0} items
                                    </td>
                                    <td style={tableCellStyle}>
                                        {user.isAdmin ? (
                                            <span style={{
                                                color: '#ffe600',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                fontSize: '0.85rem'
                                            }}>
                                                ADMIN
                                            </span>
                                        ) : (
                                            <span style={{ color: '#666' }}>USER</span>
                                        )}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(0, 243, 255, 0.05)',
                border: '1px solid #333',
                fontFamily: 'Orbitron',
                color: '#666'
            }}>
                <strong style={{ color: '#00f3ff' }}>Total Users:</strong> {users.length}
            </div>
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
    color: '#e0e0e0'
};
