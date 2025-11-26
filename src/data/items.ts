export interface ItemStats {
    [key: string]: string;
}

export type ItemRarity = 'legendary' | 'epic' | 'rare' | 'common';

export interface Item {
    id: number | string;
    name: string;
    type: 'weapon' | 'implant' | 'gear';
    price: number;
    image: string;
    stats: ItemStats;
    rarity: ItemRarity;
    description?: string;
}

export const items: Item[] = [
    {
        id: 1,
        name: "M-179 ACHILLES",
        type: "weapon",
        price: 12500,
        rarity: "epic",
        image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=2070&auto=format&fit=crop",
        stats: {
            damage: "350-420",
            rpm: "600",
            weight: "4.5kg"
        },
        description: "Militech's flagship electromagnetic precision rifle. Capable of piercing light cover and neutralizing targets at extreme ranges."
    },
    {
        id: 2,
        name: "ARASAKA MK.IV",
        type: "implant",
        price: 45000,
        rarity: "legendary",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
        stats: {
            slot: "Cortex",
            ram: "+4",
            cooldown: "-15%"
        },
        description: "Top-of-the-line cyberdeck from Arasaka. Optimized for quickhacking and daemon deployment."
    },
    {
        id: 3,
        name: "OPTICAL CAMO",
        type: "gear",
        price: 8500,
        rarity: "rare",
        image: "https://images.unsplash.com/photo-1535378437327-b71494669e9d?q=80&w=2070&auto=format&fit=crop",
        stats: {
            duration: "15s",
            visibility: "0%",
            recharge: "45s"
        },
        description: "Thermoptic camouflage system that bends light around the user, rendering them nearly invisible to the naked eye."
    },
    {
        id: 4,
        name: "MONOWIRE",
        type: "weapon",
        price: 22000,
        rarity: "epic",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        stats: {
            damage: "280",
            reach: "5m",
            speed: "Very Fast"
        },
        description: "A single molecule thick fiber optic wire. Can slice through bone and metal with ease."
    },
    {
        id: 5,
        name: "KERENZIKOV",
        type: "implant",
        price: 32000,
        rarity: "legendary",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
        stats: {
            slowmo: "90%",
            duration: "3.5s",
            reflex: "+5"
        },
        description: "Reflex booster that allows the user to move and react at superhuman speeds during combat."
    },
    {
        id: 6,
        name: "TITANIUM BONES",
        type: "implant",
        price: 15000,
        rarity: "rare",
        image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=2070&auto=format&fit=crop",
        stats: {
            capacity: "+60%",
            armor: "+200",
            fall_dmg: "-40%"
        },
        description: "Reinforced skeletal structure capable of withstanding immense pressure and impact."
    },
    {
        id: 7,
        name: "UNITY",
        type: "weapon",
        price: 4500,
        rarity: "common",
        image: "https://images.unsplash.com/photo-1585562104172-79949987c64c?q=80&w=2070&auto=format&fit=crop",
        stats: {
            damage: "80-100",
            rpm: "350",
            slots: "2"
        },
        description: "Reliable and affordable semi-automatic pistol. A favorite among street punks and mercenaries alike."
    },
    {
        id: 8,
        name: "MAXDOC MK.3",
        type: "gear",
        price: 500,
        rarity: "common",
        image: "https://images.unsplash.com/photo-1628143426054-b55c2d33456b?q=80&w=2070&auto=format&fit=crop",
        stats: {
            heal: "80%",
            instant: "Yes",
            weight: "0.2kg"
        },
        description: "Advanced medical inhaler for rapid trauma response. Instantly seals wounds and stimulates cell regeneration."
    }
];
