export interface Avatar {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

export const avatars: Avatar[] = [
    {
        id: 'netrunner',
        name: 'Netrunner',
        icon: '🌐',
        color: '#00f3ff',
        description: 'Master of the digital realm'
    },
    {
        id: 'corpo',
        name: 'Corpo',
        icon: '💼',
        color: '#ffe600',
        description: 'Corporate elite operative'
    },
    {
        id: 'samurai',
        name: 'Street Samurai',
        icon: '⚔️',
        color: '#ff0055',
        description: 'Cybernetic warrior of the streets'
    },
    {
        id: 'techie',
        name: 'Techie',
        icon: '🔧',
        color: '#00ff00',
        description: 'Tech specialist and engineer'
    },
    {
        id: 'nomad',
        name: 'Nomad',
        icon: '🏜️',
        color: '#ff8800',
        description: 'Wanderer of the wasteland'
    },
    {
        id: 'fixer',
        name: 'Fixer',
        icon: '🎭',
        color: '#a855f7',
        description: 'Deal maker and information broker'
    }
];
