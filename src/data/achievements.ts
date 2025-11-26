export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    condition: string; // Description of unlock condition
}

export const achievements: Achievement[] = [
    {
        id: 'first_purchase',
        name: 'First Blood',
        description: 'Complete your first transaction',
        icon: '🛒',
        rarity: 'common',
        condition: 'transactions >= 1'
    },
    {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spend 100,000 credits total',
        icon: '💰',
        rarity: 'rare',
        condition: 'totalSpent >= 100000'
    },
    {
        id: 'collector',
        name: 'Collector',
        description: 'Own 10 or more items',
        icon: '📦',
        rarity: 'rare',
        condition: 'inventory.length >= 10'
    },
    {
        id: 'legendary_hunter',
        name: 'Legendary Hunter',
        description: 'Acquire a legendary item',
        icon: '⭐',
        rarity: 'epic',
        condition: 'hasLegendaryItem'
    },
    {
        id: 'fully_equipped',
        name: 'Fully Equipped',
        description: 'Fill all loadout slots',
        icon: '🎯',
        rarity: 'epic',
        condition: 'allSlotsEquipped'
    },
    {
        id: 'veteran',
        name: 'Veteran',
        description: '30 days since account creation',
        icon: '🏆',
        rarity: 'legendary',
        condition: 'daysSinceJoined >= 30'
    },
    {
        id: 'shopaholic',
        name: 'Shopaholic',
        description: 'Complete 50 transactions',
        icon: '🛍️',
        rarity: 'epic',
        condition: 'transactions >= 50'
    },
    {
        id: 'arsenal',
        name: 'Arsenal',
        description: 'Own 5 weapons',
        icon: '🔫',
        rarity: 'rare',
        condition: 'weaponCount >= 5'
    }
];

// Helper function to check if achievement is unlocked
export const checkAchievement = (achievementId: string, userData: any): boolean => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return false;

    switch (achievementId) {
        case 'first_purchase':
            return (userData.transactions?.length || 0) >= 1;
        case 'big_spender':
            const totalSpent = userData.transactions?.reduce((sum: number, t: any) => sum + (t.total || 0), 0) || 0;
            return totalSpent >= 100000;
        case 'collector':
            return (userData.inventory?.length || 0) >= 10;
        case 'legendary_hunter':
            return userData.inventory?.some((item: any) => item.rarity === 'legendary') || false;
        case 'fully_equipped':
            const loadout = userData.loadout || {};
            return loadout.primary && loadout.secondary && loadout.armor && loadout.implant && loadout.gear;
        case 'veteran':
            const daysSinceJoined = (Date.now() - (userData.profile?.joinedDate || Date.now())) / (1000 * 60 * 60 * 24);
            return daysSinceJoined >= 30;
        case 'shopaholic':
            return (userData.transactions?.length || 0) >= 50;
        case 'arsenal':
            const weaponCount = userData.inventory?.filter((item: any) => item.type === 'weapon').length || 0;
            return weaponCount >= 5;
        default:
            return false;
    }
};
