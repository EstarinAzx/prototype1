# CYBER_MARKET - Component-by-Component Visualization

Detailed breakdown of each component showing internal logic, state management, data flows, and interactions.

---

## 📋 Table of Contents

1. [Login.tsx](#logintsx)
2. [Layout.tsx](#layouttsx)
3. [ProductGrid.tsx](#productgridtsx)
4. [ProductCard.tsx](#productcardtsx)
5. [ItemModal.tsx](#itemmodaltsx)
6. [CartSidebar.tsx](#cartsidebartsx)
7. [TransactionHistory.tsx](#transactionhistorytsx)
8. [Inventory.tsx](#inventorytsx)
9. [NotificationToast.tsx](#notificationtoasttsx)
10. [StoreContext.tsx](#storecontexttsx)
11. [NotificationContext.tsx](#notificationcontexttsx)
12. [soundManager.ts](#soundmanagerts)

---

## 🔐 Login.tsx

**Purpose**: Authentication screen for user login and signup

### Component Flow

```mermaid
stateDiagram-v2
    [*] --> DisplayForm
    DisplayForm --> ValidateInput: User submits
    ValidateInput --> CheckUsername: Username exists?
    CheckUsername --> CheckPassword: Password exists?
    CheckPassword --> ModeCheck: Valid
    ValidateInput --> ShowError: Missing fields
    
    ModeCheck --> LoginPath: isLogin = true
    ModeCheck --> SignupPath: isLogin = false
    
    LoginPath --> FirebaseLogin: Call login()
    SignupPath --> FirebaseSignup: Call signup()
    
    FirebaseLogin --> Success: Auth successful
    FirebaseLogin --> Error: Auth failed
    
    FirebaseSignup --> Success: Account created
    FirebaseSignup --> Error: Signup failed
    
    Success --> RedirectLayout: Show Layout component
    Error --> ShowNotification: Display error toast
    ShowError --> DisplayForm: Stay on form
    ShowNotification --> DisplayForm: Stay on form
```

### Internal State

| State Variable | Type | Purpose |
|----------------|------|---------|
| `isLogin` | boolean | Toggle between login/signup mode |
| `username` | string | User input for username |
| `password` | string | User input for password |
| `error` | string | Client-side validation errors |

### Data Flow

```mermaid
graph LR
    User[User Input] --> Form[Form Fields]
    Form --> Validate[Validation Logic]
    
    Validate -->|Valid| StoreCtx[StoreContext]
    Validate -->|Invalid| Error[Show Error]
    
    StoreCtx --> Firebase[Firebase Auth]
    Firebase -->|Success| Redirect[Render Layout]
    Firebase -->|Failure| Notif[Show Notification]
```

### Key Functions

**`handleSubmit(e)`**
- Prevents default form submission
- Validates username and password not empty
- Calls `login()` or `signup()` based on `isLogin` state
- Shows notification with result

---

## 🎨 Layout.tsx

**Purpose**: Main application layout with header, navigation, and content area

### Component Structure

```mermaid
graph TD
    Layout[Layout Component] --> Header[Header Section]
    Layout --> MainLayout[Main Layout Area]
    
    Header --> Brand[CYBER_MARKET Brand]
    Header --> SearchBar[Search Input]
    Header --> UserStats[User Stats Panel]
    
    UserStats --> InventoryBtn[Inventory Button]
    UserStats --> HistoryBtn[History Button]
    UserStats --> Username[Username Display]
    UserStats --> Credits[Credits Display]
    UserStats --> LogoutBtn[Logout Button]
    
    MainLayout --> Nav[Sidebar Navigation]
    MainLayout --> ProdGrid[ProductGrid]
    MainLayout --> CartSide[CartSidebar]
    
    Nav --> CategoryList[Category Filter]
    Nav --> SortDropdown[Sort Dropdown]
    
    Layout --> HistoryModal[TransactionHistory Modal]
    Layout --> InventoryModal[Inventory Modal]
```

### Local State Management

| State | Type | Purpose |
|-------|------|---------|
| `showHistory` | boolean | Toggle transaction history modal |
| `showInventory` | boolean | Toggle inventory modal |
| `showCart` | boolean | Toggle cart sidebar (mobile) |

### User Interactions

```mermaid
sequenceDiagram
    participant User
    participant Layout
    participant StoreCtx as StoreContext
    participant Modal
    
    User->>Layout: Search in search bar
    Layout->>StoreCtx: setSearchQuery()
    StoreCtx->>StoreCtx: Filter items
    
    User->>Layout: Click category
    Layout->>StoreCtx: setSelectedCategory()
    StoreCtx->>StoreCtx: Filter items
    
    User->>Layout: Change sort
    Layout->>StoreCtx: setSortBy()
    StoreCtx->>StoreCtx: Sort items
    
    User->>Layout: Click HISTORY
    Layout->>Modal: setShowHistory(true)
    Modal->>Modal: Display TransactionHistory
    
    User->>Layout: Click INVENTORY
    Layout->>Modal: setShowInventory(true)
    Modal->>Modal: Display Inventory
```

---

## 🔲 ProductGrid.tsx

**Purpose**: Display grid of filtered product cards

### Component Logic

```mermaid
graph LR
    StoreCtx[StoreContext] --> FilteredItems[filteredItems array]
    FilteredItems --> Map[Map over items]
    Map --> Cards[Render ProductCard components]
    
    User[User clicks card] --> SetSelected[setSelectedItem]
    SetSelected --> Modal[Show ItemModal]
```

### Internal State

- `selectedItem`: Item | null - Currently selected item for modal display

### Data Flow

```mermaid
sequenceDiagram
    participant Store as StoreContext
    participant Grid as ProductGrid
    participant Card as ProductCard
    participant Modal as ItemModal
    
    Store->>Grid: Provide filteredItems
    Grid->>Card: Render each item
    Card->>Grid: onSelect(item)
    Grid->>Modal: Show modal with item
    Modal->>Store: addToCart(item)
```

---

## 🎴 ProductCard.tsx

**Purpose**: Display individual product with image, stats, price, and actions

### Component Flow

```mermaid
graph TD
    Render[Render ProductCard] --> Image[Display Item Image]
    Render --> Stats[Display Stats]
    Render --> Actions[Action Buttons]
    
    Actions --> FavoriteBtn[Heart Icon]
    Actions --> BuyBtn[Add to Loadout]
    
    FavoriteBtn -->|Click| ToggleFav[toggleFavorite]
    BuyBtn -->|Click| AddCart[addToCart]
    
    ToggleFav --> StoreCtx[StoreContext]
    AddCart --> StoreCtx
    
    Render -->|Hover| PlaySound[soundManager.playHover]
    BuyBtn -->|Click| PlayClick[soundManager.playClick]
```

### Event Handlers

**`handleBuy(e)`**
- Stops event propagation (prevents card click)
- Plays click sound
- Calls `addToCart(item)`

**`handleFavorite(e)`**
- Stops event propagation
- Calls `toggleFavorite(item.id)`

**Card Click**
- Calls `onSelect(item)` to show modal

**Hover**
- Plays hover sound
- Scales card to 1.02x (Framer Motion)

### Styling Classes

- Base: `.product-card`
- Rarity-specific: `.rarity-legendary`, `.rarity-epic`, `.rarity-rare`, `.rarity-common`
- Each rarity has unique border glow effect

---

## 🪟 ItemModal.tsx

**Purpose**: Full-screen modal showing detailed product information

### Component Structure

```mermaid
graph TD
    Modal[Modal Overlay] --> Content[Modal Content]
    Content --> CloseBtn[Close Button X]
    Content --> TwoCol[Two-Column Layout]
    
    TwoCol --> LeftCol[Left: Image]
    TwoCol --> RightCol[Right: Details]
    
    RightCol --> Name[Item Name]
    RightCol --> Type[Item Type]
    RightCol --> Desc[Description]
    RightCol --> StatsGrid[Stats Grid]
    RightCol --> Footer[Price + Purchase Button]
    
    Footer --> PurchaseBtn[PURCHASE Button]
    
    CloseBtn -->|Click| OnClose[onClose callback]
    Modal -->|Click overlay| OnClose
    PurchaseBtn -->|Click| AddToCart[addToCart + onClose]
```

### User Interaction

```mermaid
sequenceDiagram
    participant User
    participant Modal as ItemModal
    participant Store as StoreContext
    
    User->>Modal: Click PURCHASE
    Modal->>Store: addToCart(item)
    Modal->>Modal: onClose()
    Note over Modal: Modal disappears
```

---

## 🛒 CartSidebar.tsx

**Purpose**: Shopping cart display with checkout functionality

### Component Flow

```mermaid
stateDiagram-v2
    [*] --> Empty: cart.length === 0
    [*] --> HasItems: cart.length > 0
    
    Empty --> DisplayEmptyMsg
    HasItems --> DisplayCartItems
    
    DisplayCartItems --> CalculateTotal
    CalculateTotal --> ShowCheckoutBtn
    
    ShowCheckoutBtn --> UserClicks: Click checkout
    UserClicks --> Validate: handleCheckout()
    
    Validate --> CheckEmpty: cart.length > 0?
    CheckEmpty --> CallCheckout: Yes
    CheckEmpty --> DoNothing: No
    
    CallCheckout --> StoreCheckout: checkout()
    StoreCheckout --> CheckResult
    
    CheckResult --> Success: result.success
    CheckResult --> Failed: !result.success
    
    Success --> ShowSuccessToast
    Success --> CloseCart: onClose()
    Failed --> ShowErrorToast
    
    ShowSuccessToast --> [*]
    ShowErrorToast --> DisplayCartItems
```

### Props

- `isOpen`: boolean - Control visibility (mobile)
- `onClose`: () => void - Close handler (mobile)

### Cart Item Display

Each item shows:
- Item name
- Price (¥)
- Remove button (X icon)

### Total Calculation

```javascript
const total = cart.reduce((sum, item) => sum + item.price, 0);
```

---

## 📜 TransactionHistory.tsx

**Purpose**: Modal displaying all past transactions

### Component Structure

```mermaid
graph TD
    Modal[Modal Wrapper] --> Header[Header with Title + Close]
    Modal --> Body[Transaction List]
    
    Body -->|Empty| EmptyMsg[NO TRANSACTIONS RECORDED]
    Body -->|Has Data| List[Transaction Items]
    
    List --> Item1[Transaction Card]
    Item1 --> Date[Timestamp]
    Item1 --> Total[Total Amount]
    Item1 --> Items[Item Names]
```

### Transaction Display Format

```
┌─────────────────────────────────────┐
│ 11/26/2025, 12:00:00 PM    ¥ 12,500 │
│ M-179 ACHILLES                      │
└─────────────────────────────────────┘
```

### Data Source

- Reads `transactions` from StoreContext
- Each transaction has:
  - `id`: string
  - `timestamp`: number
  - `total`: number
  - `items`: Item[]

---

## 🎒 Inventory.tsx

**Purpose**: Dual-panel inventory management with loadout system

### Component Layout

```mermaid
graph LR
    Inventory[Inventory Modal] --> Left[Left Panel: LOADOUT]
    Inventory --> Right[Right Panel: STORAGE]
    
    Left --> Slots[5 Equipment Slots]
    Slots --> Slot1[Primary Weapon]
    Slots --> Slot2[Secondary Weapon]
    Slots --> Slot3[Armor System]
    Slots --> Slot4[Cyberware]
    Slots --> Slot5[Tactical Gear]
    
    Left --> Stats[Combat Stats Display]
    
    Right --> ItemGrid[Grid of Inventory Items]
    ItemGrid -->|Click| EquipLogic[handleEquip]
    
    Slot1 -->|Equipped| UnequipBtn[Unequip Button]
```

### Equipment Slots

| Slot | Type | Icon | Purpose |
|------|------|------|---------|
| `primary` | weapon | Crosshair | Main weapon |
| `secondary` | weapon | Crosshair | Backup weapon |
| `armor` | gear | Shield | Body armor |
| `implant` | implant | Cpu | Neural implant |
| `gear` | gear | Box | Tactical equipment |

### Equipment Logic Flow

```mermaid
graph TD
    Click[User clicks item] --> CheckType{Item Type?}
    
    CheckType -->|weapon| CheckSlot{Primary empty?}
    CheckSlot -->|Yes| EquipPrimary[equipItem primary]
    CheckSlot -->|No| EquipSecondary[equipItem secondary]
    
    CheckType -->|implant| EquipImplant[equipItem implant]
    
    CheckType -->|gear| CheckName{Name contains ARMOR?}
    CheckName -->|Yes| EquipArmor[equipItem armor]
    CheckName -->|No| EquipGear[equipItem gear]
    
    EquipPrimary --> SaveFirestore[Save to Firestore]
    EquipSecondary --> SaveFirestore
    EquipImplant --> SaveFirestore
    EquipArmor --> SaveFirestore
    EquipGear --> SaveFirestore
```

### Unequip Flow

```mermaid
sequenceDiagram
    participant User
    participant Inventory
    participant Store as StoreContext
    participant Firebase as Firestore
    
    User->>Inventory: Click UNEQUIP button
    Inventory->>Store: unequipItem(slot)
    Store->>Store: loadout[slot] = null
    Store->>Firebase: saveUserData()
    Firebase-->>Store: Success
    Store->>Inventory: Re-render with empty slot
```

---

## 🔔 NotificationToast.tsx

**Purpose**: Animated toast notification with type-specific styling

### Notification Types

```mermaid
graph TD
    Notification[Notification Type] --> Success[success]
    Notification --> Error[error]
    Notification --> Info[info]
    
    Success --> SuccessStyle[Green border<br/>CheckCircle icon<br/>Success sound]
    Error --> ErrorStyle[Pink/Red border<br/>AlertTriangle icon<br/>Error sound]
    Info --> InfoStyle[Cyan border<br/>Info icon<br/>Click sound]
```

### Styling Config

| Type | Color | Background | Icon |
|------|-------|------------|------|
| success | #00ff00 | rgba(0, 20, 0, 0.9) | CheckCircle |
| error | #ff0055 | rgba(20, 0, 5, 0.9) | AlertTriangle |
| info | #00f3ff | rgba(0, 20, 40, 0.9) | Info |

### Animation Lifecycle

```mermaid
sequenceDiagram
    participant System
    participant Toast
    participant User
    
    System->>Toast: Create notification
    Toast->>Toast: Animate IN (slide from right)
    Note over Toast: Display for 3 seconds
    Toast->>Toast: Animate OUT (slide to right)
    Toast->>System: Auto-remove
    
    User->>Toast: Click X button
    Toast->>Toast: Animate OUT immediately
    Toast->>System: Manual remove
```

### Framer Motion Config

```javascript
initial: { x: 100, opacity: 0 }
animate: { x: 0, opacity: 1 }
exit: { x: 100, opacity: 0, scale: 0.9 }
transition: { type: 'spring', stiffness: 300, damping: 25 }
```

---

## 🏪 StoreContext.tsx

**Purpose**: Global state management for the entire application

### State Architecture

```mermaid
graph TD
    StoreContext[StoreContext Provider] --> AppState[Application State]
    
    AppState --> UserState[User State]
    AppState --> CartState[Cart State]
    AppState --> ItemState[Item State]
    AppState --> UIState[UI State]
    
    UserState --> User[user: User | null]
    UserState --> Loading[loading: boolean]
    UserState --> Credits[credits: number]
    UserState --> Inventory[inventory: Item Array]
    UserState --> Loadout[loadout: Loadout Object]
    UserState --> Transactions[transactions: Array]
    UserState --> Favorites[favorites: number Array]
    
    CartState --> Cart[cart: Item Array]
    
    ItemState --> Items[items: Item Array]
    ItemState --> FilteredItems[filteredItems: Item Array]
    
    UIState --> Search[searchQuery: string]
    UIState --> Category[selectedCategory: string]
    UIState --> Sort[sortBy: string]
```

### Key Functions Overview

```mermaid
graph TB
    Functions[StoreContext Functions] --> Auth[Authentication]
    Functions --> Shopping[Shopping Actions]
    Functions --> Equipment[Equipment Actions]
    Functions --> Social[Social Actions]
    
    Auth --> Login[login username password]
    Auth --> Signup[signup username password]
    Auth --> Logout[logout]
    
    Shopping --> AddCart[addToCart item]
    Shopping --> RemoveCart[removeFromCart index]
    Shopping --> Clear[clearCart]
    Shopping --> Checkout[checkout]
    
    Equipment --> Equip[equipItem item slot]
    Equipment --> Unequip[unequipItem slot]
    
    Social --> ToggleFav[toggleFavorite id]
```

### Firebase Integration Flow

```mermaid
sequenceDiagram
    participant Component
    participant Store as StoreContext
    participant LocalState as Local State
    participant Firebase as Firestore
    
    Note over Store: On Auth State Change
    Firebase->>Store: onAuthStateChanged(user)
    Store->>Firebase: loadUserData(uid)
    Firebase-->>Store: User document
    Store->>LocalState: Update all state
    
    Note over Store: On User Action
    Component->>Store: Action (e.g., addToCart)
    Store->>LocalState: Update local state
    Store->>Store: saveUserData()
    Store->>Firebase: updateDoc(users/{uid})
    Firebase-->>Store: Success
```

### Checkout Logic

```mermaid
graph TD
    Start[checkout called] --> CheckEmpty{cart.length > 0?}
    CheckEmpty -->|No| ReturnFail[Return: error message]
    
    CheckEmpty -->|Yes| CheckCredits{credits >= total?}
    CheckCredits -->|No| ReturnInsufficient[Return: insufficient credits]
    
    CheckCredits -->|Yes| Process[Process Transaction]
    Process --> DeductCredits[credits -= total]
    Process --> MoveToInventory[cart items → inventory]
    Process --> CreateTransaction[Create transaction record]
    Process --> ClearCart[cart = empty array]
    
    Process --> Save[saveUserData to Firestore]
    Save --> PlaySound[soundManager.playPurchase]
    PlaySound --> ReturnSuccess[Return: success message]
```

### Item Filtering Logic

```mermaid
graph TD
    AllItems[items from items.ts] --> SearchFilter{searchQuery?}
    SearchFilter -->|Yes| NameMatch[Filter by name match]
    SearchFilter -->|No| CategoryFilter
    
    NameMatch --> CategoryFilter{selectedCategory?}
    CategoryFilter -->|all| SortStep
    CategoryFilter -->|specific| TypeMatch[Filter by item.type]
    
    TypeMatch --> SortStep{sortBy?}
    SortStep -->|""| ReturnFiltered[Return filteredItems]
    SortStep -->|price-asc| SortPriceAsc[Sort by price ascending]
    SortStep -->|price-desc| SortPriceDesc[Sort by price descending]
    SortStep -->|name| SortName[Sort alphabetically]
    
    SortPriceAsc --> ReturnFiltered
    SortPriceDesc --> ReturnFiltered
    SortName --> ReturnFiltered
```

---

## 🔔 NotificationContext.tsx

**Purpose**: Manage global notification toast system

### Context Architecture

```mermaid
graph TD
    NotifCtx[NotificationContext] --> State[notifications array]
    NotifCtx --> Method[showNotification method]
    
    Method --> CreateNotif[Create notification object]
    CreateNotif --> AddToArray[Add to notifications]
    AddToArray --> SetTimeout[setTimeout 3000ms]
    SetTimeout --> AutoRemove[Remove from array]
    
    State --> Render[Render NotificationToast components]
    Render --> Toast1[Toast 1]
    Render --> Toast2[Toast 2]
```

### Notification Lifecycle

```mermaid
sequenceDiagram
    participant Component
    participant Context as NotificationContext
    participant State
    participant Toast as NotificationToast
    
    Component->>Context: showNotification(message, type)
    Context->>Context: Generate unique ID
    Context->>State: Add to notifications array
    State->>Toast: Render new toast
    
    Note over Context: Wait 3 seconds
    Context->>State: Remove notification by ID
    State->>Toast: AnimatePresence exit
    Toast->>Toast: Slide out animation
```

### Usage Pattern

```typescript
const { showNotification } = useNotification();

// Success
showNotification('Transaction completed!', 'success');

// Error
showNotification('Insufficient credits', 'error');

// Info
showNotification('Item added to cart', 'info');
```

---

## 🎵 soundManager.ts

**Purpose**: Web Audio API sound effect system

### Sound Manager Architecture

```mermaid
graph TD
    SoundManager[SoundManager Class] --> AudioCtx[AudioContext]
    SoundManager --> Methods[Sound Methods]
    SoundManager --> State[enabled: boolean]
    
    Methods --> PlayClick[playClick 800Hz 0.05s]
    Methods --> PlayHover[playHover 600Hz 0.03s]
    Methods --> PlayPurchase[playPurchase multi-tone]
    Methods --> PlayError[playError descending]
    Methods --> ToggleMute[toggleMute]
    
    PlayClick --> CreateBeep[createBeep]
    PlayHover --> CreateBeep
    
    PlayPurchase --> Beep1[450Hz 0.1s]
    PlayPurchase --> Beep2[550Hz 0.1s delay 80ms]
    PlayPurchase --> Beep3[650Hz 0.15s delay 160ms]
    
    PlayError --> ErrorBeep1[200Hz 0.15s]
    PlayError --> ErrorBeep2[150Hz 0.2s delay 100ms]
```

### Sound Specifications

| Sound | Frequency | Duration | Volume | Description |
|-------|-----------|----------|--------|-------------|
| Click | 800 Hz | 50ms | 0.05 | UI button clicks |
| Hover | 600 Hz | 30ms | 0.03 | Card hover effects |
| Purchase | 450→550→650 Hz | 250ms total | 0.06 | Checkout success |
| Error | 200→150 Hz | 300ms total | 0.08 | Failed actions |

### Web Audio Implementation

```mermaid
sequenceDiagram
    participant Call as Function Call
    participant Manager as SoundManager
    participant Web as Web Audio API
    
    Call->>Manager: playClick()
    Manager->>Manager: Check if enabled
    Manager->>Web: createOscillator()
    Manager->>Web: createGain()
    Web->>Web: Connect nodes
    Web->>Web: Set frequency & type
    Web->>Web: Exponential ramp gain
    Web->>Web: start() → stop()
    Note over Web: Sound plays for duration
```

### Usage in Components

```typescript
import { soundManager } from '../utils/soundManager';

// On button click
soundManager.playClick();

// On card hover
soundManager.playHover();

// On successful purchase
soundManager.playPurchase();

// On error
soundManager.playError();

// Toggle mute
soundManager.toggleMute();
```

---

## 🔄 Cross-Component Data Flow Summary

### Complete User Journey: Browse → Add to Cart → Checkout

```mermaid
sequenceDiagram
    participant User
    participant Layout
    participant Grid as ProductGrid
    participant Card as ProductCard
    participant Modal as ItemModal
    participant Cart as CartSidebar
    participant Store as StoreContext
    participant Sound as soundManager
    participant Notif as NotificationContext
    participant Firebase as Firestore
    
    User->>Layout: Browse products
    Layout->>Grid: Render filtered items
    Grid->>Card: Display product cards
    
    User->>Card: Hover over card
    Card->>Sound: playHover()
    
    User->>Card: Click card
    Card->>Modal: Show item details
    
    User->>Modal: Click PURCHASE
    Modal->>Sound: playClick()
    Modal->>Store: addToCart(item)
    
    Store->>Store: Validate (not in inventory)
    Store->>Store: Validate (cart < 10)
    Store->>Store: Add to cart array
    Store->>Firebase: saveUserData()
    
    Modal->>Modal: Close modal
    Cart->>Cart: Update cart display
    
    User->>Cart: Click INITIATE_TRANSACTION
    Cart->>Store: checkout()
    
    Store->>Store: Validate cart not empty
    Store->>Store: Validate credits >= total
    Store->>Store: Deduct credits
    Store->>Store: Move items to inventory
    Store->>Store: Create transaction record
    Store->>Store: Clear cart
    Store->>Firebase: saveUserData()
    
    Store->>Sound: playPurchase()
    Store->>Notif: showNotification(success)
    
    Notif->>User: Display success toast
    Cart->>Cart: Close sidebar
```

---

## 📊 State Management Patterns

### Context Provider Hierarchy

```
App
├── NotificationProvider (outer)
│   └── StoreProvider (inner)
│       └── AppContent
│           ├── Login (if not authenticated)
│           └── Layout (if authenticated)
│               └── All child components
```

### Hook Usage Pattern

```typescript
// In any component
import { useStore } from '../context/StoreContext';
import { useNotification } from '../context/NotificationContext';

const MyComponent = () => {
    const { user, cart, addToCart, credits } = useStore();
    const { showNotification } = useNotification();
    
    // Use context values and methods
};
```

---

## 🎭 Animation Patterns

### Framer Motion Usage Across Components

| Component | Animation | Purpose |
|-----------|-----------|---------|
| ProductCard | `whileHover={{ scale: 1.02 }}` | Highlight on hover |
| ProductCard | `initial={{ opacity: 0, y: 20 }}` | Fade in from below |
| ItemModal | `initial={{ scale: 0.9 }}` | Zoom in modal |
| NotificationToast | `initial={{ x: 100 }}` | Slide in from right |
| CartSidebar | `initial={{ x: 20 }}` | Slide cart items in |
| Inventory | `whileHover={{ scale: 1.05 }}` | Item card hover |

### AnimatePresence Wrapping

Used for exit animations on:
- NotificationToast (auto-dismiss)
- ItemModal (close modal)
- TransactionHistory (close modal)
- Inventory (close modal)
- Cart items (remove from cart)

---

## 🔗 Component Dependencies Graph

```mermaid
graph TB
    App[App.tsx] --> NotifCtx[NotificationContext]
    App --> StoreCtx[StoreContext]
    
    StoreCtx --> Firebase[firebase.ts]
    StoreCtx --> Items[data/items.ts]
    StoreCtx --> Sound[utils/soundManager.ts]
    
    NotifCtx --> Toast[NotificationToast.tsx]
    
    StoreCtx --> Layout[Layout.tsx]
    StoreCtx --> Login[Login.tsx]
    
    Layout --> Grid[ProductGrid.tsx]
    Layout --> Cart[CartSidebar.tsx]
    Layout --> History[TransactionHistory.tsx]
    Layout --> Inventory[Inventory.tsx]
    
    Grid --> Card[ProductCard.tsx]
    Grid --> Modal[ItemModal.tsx]
    
    Card --> Sound
    Modal --> StoreCtx
    Cart --> StoreCtx
    Cart --> NotifCtx
    
    Firebase --> AuthAPI[Firebase Auth]
    Firebase --> FirestoreAPI[Firestore]
```

---

## 🎯 Critical Interaction Points

### Where Components Talk to StoreContext

| Component | Methods Used | Data Read |
|-----------|-------------|-----------|
| Login | `login()`, `signup()` | `user`, `loading` |
| Layout | `logout()`, `setSearchQuery()`, `setSelectedCategory()`, `setSortBy()` | `credits`, `user`, `searchQuery`, `selectedCategory` |
| ProductGrid | - | `filteredItems` |
| ProductCard | `addToCart()`, `toggleFavorite()` | `favorites` |
| ItemModal | `addToCart()` | - |
| CartSidebar | `removeFromCart()`, `checkout()` | `cart` |
| TransactionHistory | - | `transactions` |
| Inventory | `equipItem()`, `unequipItem()` | `user.inventory`, `user.loadout` |

---

## 🚀 Performance Considerations

### Optimization Patterns

1. **Memoization Opportunities**
   - `filteredItems` could use `useMemo` for expensive filtering
   - Stats calculations in Inventory could be memoized

2. **Re-render Triggers**
   - Every StoreContext update re-renders ALL consumers
   - Consider splitting context into smaller pieces for large apps

3. **Firebase Optimization**
   - `saveUserData()` called on EVERY cart/inventory change
   - Could implement debouncing for frequent updates

4. **Animation Performance**
   - Framer Motion animations use GPU acceleration
   - Large grids might benefit from virtualization

---

## 📝 Summary

This cyberpunk store uses a **centralized state management pattern** with React Context, **real-time Firebase synchronization**, and **rich animations** via Framer Motion. Key design patterns include:

- Single source of truth (StoreContext)
- Optimistic UI updates with Firebase sync
- Sound effect feedback for all interactions
- Toast notifications for user feedback
- Modular component architecture with clear responsibilities
