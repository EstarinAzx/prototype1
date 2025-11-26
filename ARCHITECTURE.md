# CYBER_MARKET - Code Architecture Visualization

## Summary

- **Project**: CYBER_MARKET - A cyberpunk-themed in-game store prototype
- **Tech Stack**: React 19, TypeScript, Firebase (Auth + Firestore), Vite, Framer Motion
- **Architecture**: Context-based state management with global providers
- **Key Features**: User authentication, shopping cart system, transaction history, inventory management, favorites/wishlist
- **Entry Point**: User interacts through `Login.tsx` → authenticated users see `Layout.tsx` with product browsing and cart features

---

## 📐 High-Level Architecture

```mermaid
graph TB
    subgraph "Entry Layer"
        HTML[index.html]
        Main[main.tsx]
        App[App.tsx]
    end
    
    subgraph "Context Providers"
        NotifCtx[NotificationContext]
        StoreCtx[StoreContext]
    end
    
    subgraph "UI Components"
        Login[Login.tsx]
        Layout[Layout.tsx]
        ProdGrid[ProductGrid.tsx]
        ProdCard[ProductCard.tsx]
        Cart[CartSidebar.tsx]
        History[TransactionHistory.tsx]
        Inventory[Inventory.tsx]
        Toast[NotificationToast.tsx]
    end
    
    subgraph "Backend Services"
        Firebase[firebase.ts]
        Auth[Firebase Auth]
        Firestore[Firebase Firestore]
    end
    
    subgraph "Data & Utils"
        Items[items.ts]
        Sound[soundManager.ts]
        Styles[index.css]
    end
    
    HTML --> Main
    Main --> App
    App --> NotifCtx
    NotifCtx --> StoreCtx
    StoreCtx --> Login
    StoreCtx --> Layout
    
    Layout --> ProdGrid
    Layout --> Cart
    Layout --> History
    Layout --> Inventory
    
    ProdGrid --> ProdCard
    NotifCtx --> Toast
    
    StoreCtx --> Firebase
    Firebase --> Auth
    Firebase --> Firestore
    
    StoreCtx --> Items
    StoreCtx --> Sound
    
    App -.styles.-> Styles
```

---

## 🔄 Application Boot Flow

```mermaid
sequenceDiagram
    participant User
    participant HTML as index.html
    participant Main as main.tsx
    participant App as App.tsx
    participant NP as NotificationProvider
    participant SP as StoreProvider
    participant AC as AppContent
    participant FB as Firebase
    
    User->>HTML: Load page
    HTML->>Main: Mount React
    Main->>App: Render App
    App->>NP: Wrap with NotificationProvider
    NP->>SP: Wrap with StoreProvider
    SP->>FB: Initialize Firebase Auth
    FB->>SP: onAuthStateChanged()
    SP->>SP: loadUserData() if authenticated
    SP->>AC: Provide context (user, loading)
    
    alt User authenticated
        AC->>AC: Render <Layout />
    else User not authenticated
        AC->>AC: Render <Login />
    end
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Login as Login.tsx
    participant Store as StoreContext
    participant FBAuth as Firebase Auth
    participant FBStore as Firestore
    
    User->>Login: Enter username/password
    Login->>Login: handleSubmit()
    
    alt New User (Signup)
        Login->>Store: signup(username, password)
        Store->>FBAuth: createUserWithEmailAndPassword()
        FBAuth-->>Store: uid
        Store->>FBStore: Create user document
        Note over FBStore: Initial data:<br/>credits: 50000<br/>cart: []<br/>transactions: []
        Store-->>Login: Success
    else Existing User (Login)
        Login->>Store: login(username, password)
        Store->>FBAuth: signInWithEmailAndPassword()
        FBAuth-->>Store: uid
        Store->>Store: loadUserData(uid)
        Store->>FBStore: getDoc(users/{uid})
        FBStore-->>Store: User data
        Store-->>Login: Success
    end
    
    Login->>Login: Redirect to Layout
```

---

## 🛒 Shopping & Checkout Flow

```mermaid
graph TD
    Start[User browses ProductGrid] --> Select[Click ProductCard]
    Select --> Modal[ItemModal opens]
    Modal --> AddCart[Click 'ADD TO LOADOUT']
    
    AddCart --> CheckInventory{Item already<br/>in inventory?}
    CheckInventory -->|Yes| Error1[Show error notification]
    CheckInventory -->|No| CheckCapacity{Cart < 10<br/>items?}
    
    CheckCapacity -->|No| Error2[Show 'LOADOUT FULL' error]
    CheckCapacity -->|Yes| AddSuccess[addToCart item]
    
    AddSuccess --> PlaySound[Play click sound]
    PlaySound --> UpdateUI[CartSidebar updates]
    
    UpdateUI --> UserReview[User reviews cart]
    UserReview --> Checkout[Click 'INITIATE_TRANSACTION']
    
    Checkout --> CheckEmpty{Cart empty?}
    CheckEmpty -->|Yes| Return[Do nothing]
    CheckEmpty -->|No| CheckCredits{Credits >=<br/>total?}
    
    CheckCredits -->|No| ErrorCredits[Show insufficient credits error]
    CheckCredits -->|Yes| Process[Process transaction]
    
    Process --> DeductCredits[credits -= total]
    Process --> AddInventory[Add items to inventory]
    Process --> LogTransaction[Save transaction record]
    Process --> ClearCart[Clear cart]
    Process --> SaveFirestore[Save to Firestore]
    
    SaveFirestore --> SuccessSound[Play success sound]
    SuccessSound --> Notification[Show success notification]
```

---

## 📦 Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> NotifProvider[NotificationProvider]
    NotifProvider --> StoreProvider[StoreProvider]
    StoreProvider --> AppContent[AppContent]
    
    AppContent -->|if authenticated| Layout[Layout.tsx]
    AppContent -->|if not authenticated| Login[Login.tsx]
    
    Layout --> Header[Header Section]
    Layout --> Search[Search Bar]
    Layout --> Filters[Category/Sort Filters]
    Layout --> ProductGrid[ProductGrid.tsx]
    Layout --> CartSidebar[CartSidebar.tsx]
    Layout --> TransactionHistory[TransactionHistory.tsx]
    Layout --> Inventory[Inventory.tsx]
    
    ProductGrid --> ProductCard1[ProductCard]
    ProductGrid --> ProductCard2[ProductCard]
    ProductGrid --> ProductCardN[ProductCard ...]
    
    ProductCard1 --> ItemModal[ItemModal.tsx]
    
    NotifProvider --> NotificationToast1[NotificationToast]
    NotifProvider --> NotificationToast2[NotificationToast ...]
```

---

## 📂 Project File Structure

```
CYBER_MARKET/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies (React, Firebase, Framer Motion)
├── vite.config.ts               # Vite build config
├── .env                         # Firebase credentials
│
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component with providers
│   ├── App.css                  # App-specific styles
│   ├── index.css                # Global cyberpunk styles (16KB+)
│   │
│   ├── firebase.ts              # Firebase initialization
│   │
│   ├── components/              # UI Components
│   │   ├── Login.tsx           # Authentication screen
│   │   ├── Layout.tsx          # Main app layout
│   │   ├── ProductGrid.tsx     # Grid of all products
│   │   ├── ProductCard.tsx     # Individual product display
│   │   ├── ItemModal.tsx       # Product detail modal
│   │   ├── CartSidebar.tsx     # Shopping cart UI
│   │   ├── TransactionHistory.tsx
│   │   ├── Inventory.tsx       # User's owned items
│   │   └── NotificationToast.tsx
│   │
│   ├── context/                # State Management
│   │   ├── StoreContext.tsx    # Global store state (324 lines)
│   │   └── NotificationContext.tsx
│   │
│   ├── data/
│   │   └── items.ts            # Product catalog (8 items)
│   │
│   └── utils/
│       └── soundManager.ts     # Audio playback system
│
└── dist/                        # Production build output
```

---

## 🔑 Key Data Flows

### Firebase Data Structure

```mermaid
graph LR
    subgraph "Firebase Auth"
        AuthUser[User Account<br/>uid, email]
    end
    
    subgraph "Firestore: /users/{uid}"
        UserDoc[User Document]
        Username[username: string]
        Credits[credits: number]
        Cart[cart: Item Array]
        Transactions[transactions: Transaction Array]
        Favorites[favorites: number Array]
        Inventory[inventory: Item Array]
        Loadout[loadout: Object]
    end
    
    AuthUser -->|uid| UserDoc
    UserDoc --> Username
    UserDoc --> Credits
    UserDoc --> Cart
    UserDoc --> Transactions
    UserDoc --> Favorites
    UserDoc --> Inventory
    UserDoc --> Loadout
```

### State Management Pattern

```mermaid
graph TD
    StoreContext[StoreContext<br/>Global State] --> LocalState[Local State]
    StoreContext --> FirestoreSync[Auto-sync to Firestore]
    
    LocalState --> Items[items: Item Array]
    LocalState --> Cart[cart: Item Array]
    LocalState --> Credits[credits: number]
    LocalState --> User[user: User Object]
    LocalState --> Transactions[transactions: Array]
    LocalState --> Favorites[favorites: number Array]
    LocalState --> Filters[search/category/sort]
    
    FirestoreSync -->|saveUserData| Firestore[(Firestore)]
    Firestore -->|loadUserData| StoreContext
    
    Components[React Components] -->|useStore hook| StoreContext
    Components -->|Actions| Actions[addToCart<br/>checkout<br/>toggleFavorite<br/>equipItem]
    Actions --> LocalState
    Actions --> FirestoreSync
```

---

## 🎯 Critical Entry Points

### User Actions & Hooks

| User Action | Entry Point | Flow |
|-------------|-------------|------|
| **Page Load** | `main.tsx` → `App.tsx` | Initialize providers → Check auth → Show Login/Layout |
| **Login/Signup** | `Login.tsx` → `handleSubmit()` | Validate → Firebase Auth → Load user data → Show Layout |
| **Browse Products** | `Layout.tsx` → `ProductGrid.tsx` | Render `filteredItems` from StoreContext |
| **Add to Cart** | `ProductCard.tsx` → `addToCart()` | Validate → Update cart state → Save to Firestore |
| **Checkout** | `CartSidebar.tsx` → `checkout()` | Validate credits → Deduct → Move to inventory → Clear cart → Save |
| **Toggle Favorite** | `ProductCard.tsx` → `toggleFavorite()` | Add/remove ID from favorites array → Save |
| **View History** | `Layout.tsx` → `TransactionHistory.tsx` | Display transactions from StoreContext |
| **View Inventory** | `Layout.tsx` → `Inventory.tsx` | Display inventory items → Equip to loadout slots |

---

## 🎨 Key Technologies

```mermaid
graph LR
    subgraph "Frontend"
        React[React 19]
        TS[TypeScript]
        Motion[Framer Motion]
        Icons[Lucide React]
    end
    
    subgraph "Build"
        Vite[Vite 7]
        ESLint[ESLint]
    end
    
    subgraph "Backend"
        FB[Firebase 12.6]
        Auth[Firebase Auth]
        FS[Firestore]
    end
    
    subgraph "Styling"
        CSS[Vanilla CSS]
        Cyber[Cyberpunk Theme]
        Fonts[Orbitron/Rajdhani]
    end
    
    React --> Motion
    React --> Icons
    React --> TS
    
    TS --> Vite
    Vite --> ESLint
    
    React --> FB
    FB --> Auth
    FB --> FS
    
    React --> CSS
    CSS --> Cyber
    Cyber --> Fonts
```

---

## 🔍 Key Observations

### Entry Points
- **Main entry**: `main.tsx` renders `App.tsx` into `#root`
- **Authentication gate**: `AppContent` component checks `user` state to show `Login` or `Layout`
- **User interactions**: All product interactions flow through `StoreContext` methods

### Data Sources
- **Static catalog**: `items.ts` contains 8 predefined items (weapons, implants, gear)
- **User data**: Loaded from Firestore `/users/{uid}` on authentication
- **Real-time sync**: All cart, inventory, and transaction changes auto-save to Firestore via `saveUserData()`

### Side Effects
- **Firebase writes**: Triggered by `checkout()`, `addToCart()`, `toggleFavorite()`, `equipItem()`, `unequipItem()`
- **Audio playback**: `soundManager.ts` plays click/hover/success/error sounds
- **Notifications**: `NotificationContext` displays toast messages for 3 seconds

### UI Updates & State Flow
- **Context consumers**: Components use `useStore()` hook to access global state
- **Filtered display**: `ProductGrid` shows `filteredItems` based on search/category/sort
- **Cart updates**: `CartSidebar` displays real-time cart contents and calculated total
- **Animations**: Framer Motion handles enter/exit animations for cards, modals, toasts

### Missing Context
- **Legacy code**: `_legacy` folder contains old JavaScript files (not currently used)
- **Sound files**: Sound manager references audio URLs (not visible in file structure)
- **Environment variables**: `.env` contains Firebase credentials (not shown for security)
- **Build output**: `dist/` folder contains production bundle

---

## 📝 Notes for Other Agents

**Architect**: 
- State management is centralized in `StoreContext.tsx` (324 lines) - consider splitting if adding more features
- Firebase operations in same file as React context - could separate into service layer
- No routing library used (single-page app with conditional rendering)

**Implementer**: 
- When modifying authentication: Start from `Login.tsx` → `StoreContext.login()/signup()`
- When adding new products: Update `data/items.ts`
- When adding features: Add methods to `StoreContext` and expose via context value
- All Firebase operations use async/await pattern

**Refactorer**: 
- `StoreContext.tsx` handles both state management AND Firebase operations - could separate concerns
- `Layout.tsx` manages multiple modals/sidebars - could extract state management
- Inline styles in some components (`Login.tsx`, `CartSidebar.tsx`) - could move to CSS

**Verifier**: 
- Critical paths for tests:
  1. Auth flow: `Login → signup → Firestore write → user state update`
  2. Purchase flow: `ProductCard → addToCart → checkout → inventory update → Firestore sync`
  3. Favorites: `ProductCard → toggleFavorite → Firestore sync`
- Firebase operations depend on `.env` configuration
- No test files currently in project

---

## 🚀 Development Workflow

```mermaid
graph LR
    Dev[npm run dev] --> Vite[Vite Dev Server]
    Vite --> HMR[Hot Module Reload]
    
    Build[npm run build] --> TSC[TypeScript Compile]
    TSC --> ViteBuild[Vite Build]
    ViteBuild --> Dist[dist/ folder]
    
    Lint[npm run lint] --> ESLint[ESLint Check]
```

**Commands**:
- `npm run dev` - Start development server with HMR
- `npm run build` - TypeScript compile → Vite production build
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally
