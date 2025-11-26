import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

interface AnalyticsData {
    totalUsers: number;
    totalRevenue: number;
    totalTransactions: number;
    popularItems: { name: string; count: number }[];
}

export const Analytics: React.FC = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalUsers: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        popularItems: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            // Load users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Calculate revenue and transactions
            let totalRevenue = 0;
            let totalTransactions = 0;
            const itemCounts: { [key: string]: number } = {};

            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const transactions = userData.transactions || [];

                transactions.forEach((transaction: any) => {
                    totalRevenue += transaction.total || 0;
                    totalTransactions++;

                    // Count popular items
                    transaction.items?.forEach((item: any) => {
                        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
                    });
                });
            });

            // Get top 5 popular items
            const popularItems = Object.entries(itemCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setAnalytics({
                totalUsers,
                totalRevenue,
                totalTransactions,
                popularItems
            });
            setLoading(false);
        } catch (error) {
            console.error('Error loading analytics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '50px',
                color: '#666',
                fontFamily: 'Orbitron'
            }}>
                LOADING ANALYTICS...
            </div>
        );
    }

    return (
        <div>
            <h2 style={{
                fontFamily: 'Orbitron',
                color: '#00f3ff',
                fontSize: '1.5rem',
                marginBottom: '30px'
            }}>
                SYSTEM ANALYTICS
            </h2>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <StatCard
                    icon={Users}
                    label="TOTAL USERS"
                    value={analytics.totalUsers.toString()}
                    color="#00f3ff"
                />
                <StatCard
                    icon={DollarSign}
                    label="TOTAL REVENUE"
                    value={`¥${analytics.totalRevenue.toLocaleString()}`}
                    color="#ffe600"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="TRANSACTIONS"
                    value={analytics.totalTransactions.toString()}
                    color="#ff0055"
                />
                <StatCard
                    icon={TrendingUp}
                    label="AVG TRANSACTION"
                    value={`¥${Math.round(analytics.totalRevenue / (analytics.totalTransactions || 1)).toLocaleString()}`}
                    color="#a855f7"
                />
            </div>

            {/* Popular Items */}
            <div style={{
                background: 'rgba(0, 243, 255, 0.05)',
                border: '1px solid #333',
                padding: '20px',
                borderRadius: '4px'
            }}>
                <h3 style={{
                    fontFamily: 'Orbitron',
                    color: '#00f3ff',
                    fontSize: '1.2rem',
                    marginBottom: '20px'
                }}>
                    MOST POPULAR ITEMS
                </h3>
                {analytics.popularItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {analytics.popularItems.map((item, index) => (
                            <div key={item.name} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid #222'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{
                                        fontFamily: 'Orbitron',
                                        color: '#ffe600',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold'
                                    }}>
                                        #{index + 1}
                                    </span>
                                    <span style={{
                                        fontFamily: 'Rajdhani',
                                        fontSize: '1.1rem',
                                        color: '#e0e0e0'
                                    }}>
                                        {item.name}
                                    </span>
                                </div>
                                <span style={{
                                    fontFamily: 'Orbitron',
                                    color: '#00f3ff',
                                    fontSize: '1rem'
                                }}>
                                    {item.count} sold
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: '#666', fontFamily: 'Rajdhani', textAlign: 'center', padding: '20px' }}>
                        No transaction data available yet.
                    </div>
                )}
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.FC<{ size: number }>;
    label: string;
    value: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
    return (
        <div style={{
            background: `rgba(${hexToRgb(color)}, 0.05)`,
            border: `1px solid ${color}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color }}>
                    <Icon size={24} />
                </div>
                <span style={{
                    fontFamily: 'Orbitron',
                    fontSize: '0.85rem',
                    color: '#666',
                    letterSpacing: '1px'
                }}>
                    {label}
                </span>
            </div>
            <div style={{
                fontFamily: 'Orbitron',
                fontSize: '2rem',
                color,
                fontWeight: 'bold'
            }}>
                {value}
            </div>
        </div>
    );
};

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
};
