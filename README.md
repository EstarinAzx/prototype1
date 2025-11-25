# CYBER_MARKET

A cyberpunk-themed in-game store prototype built with React, TypeScript, and Firebase.

## 🎮 Features

### 🔐 Authentication
- Username/password authentication via Firebase Auth
- Secure user accounts with persistent sessions
- User-specific data and inventory

### 💰 Economy System
- Virtual credit system (¥50,000 starting credits)
- Shopping cart ("Loadout") with real-time total calculation
- Transaction processing with credit deduction
- Purchase history tracking with timestamps

### ✨ Item Rarity System
- **Legendary** - Gold animated glow effect
- **Epic** - Purple glow effect  
- **Rare** - Blue glow effect
- **Common** - Standard gray border

### 🔊 Sound Effects
- Click sounds for UI interactions
- Hover sounds on item cards
- Success chime for purchases
- Error buzz for failed transactions

### 📋 Transaction History
- Complete purchase log with timestamps
- Item details and total cost
- Accessible via "HISTORY" button in header

### ❤️ Favorites/Wishlist
- Mark items as favorites
- Heart icon toggle on item cards
- Persistent across sessions

### 🔍 Search & Filter
- Real-time search by item name
- Category filtering (All, Weapon, Implant, Gear)
- Sort by price (low/high) or name

### 💾 Cloud Storage
- Firebase Firestore integration
- Auto-sync user data (cart, credits, transactions, favorites)
- Real-time data persistence

### 🎨 Cyberpunk Aesthetics
- Neon color scheme (Cyan, Pink, Yellow)
- CRT overlay and scanline effects
- Glitch animations
- Custom UI with angled panels
- Orbitron/Rajdhani font pairing

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 7
- **Backend**: Firebase (Auth + Firestore)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Audio**: Web Audio API (custom sound manager)

## 📦 Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/EstarinAzx/prototype1.git
   cd prototype1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy your Firebase config to `.env`:
     ```env
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Features in Detail

### Item Catalog
Sample items include:
- Neural Implants (ARES CORTEX V2, SYNAPTIC ENHANCER)
- Weapons (PHANTOM X-9, M-179 ACHILLES)
- Armor (TITANIUM PLATE, REACTIVE ARMOR)
- Gear (STEALTH MODULE, RECON DRONE)

Each item has:
- Rarity tier
- Price in credits (¥)
- Stats (Damage, Defense, Stealth, etc.)
- Detailed description

### User Data Structure
```typescript
{
  username: string;
  credits: number;
  cart: Item[];
  transactions: Transaction[];
  favorites: number[];
  createdAt: timestamp;
}
```

## 🛠️ Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Authentication UI
│   ├── Layout.tsx      # Main app layout
│   ├── ProductCard.tsx # Item display
│   ├── CartSidebar.tsx # Shopping cart
│   └── TransactionHistory.tsx
├── context/            
│   └── StoreContext.tsx # Global state management
├── data/
│   └── items.ts        # Item catalog
├── utils/
│   └── soundManager.ts # Audio system
├── firebase.ts         # Firebase configuration
└── index.css          # Cyberpunk styles
```

## 📝 License

MIT

## 🤝 Contributing

This is a prototype project. Feel free to fork and experiment!

---

**Built with ⚡ by EstarinAzx**
