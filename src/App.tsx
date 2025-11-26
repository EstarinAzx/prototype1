// ============================================
// IMPORTS
// ============================================
import { StoreProvider } from './context/StoreContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { useStore } from './context/StoreContext';

// ============================================
// APP CONTENT COMPONENT
// ============================================
// Inner component that has access to StoreContext
// Decides whether to show Login or Layout based on auth state
// ============================================
const AppContent = () => {
  // Get authentication state from StoreContext
  const { user, loading } = useStore();

  // ============================================
  // LOADING STATE
  // Show loading screen while checking auth
  // ============================================
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000',
        color: '#00f3ff',
        fontFamily: 'Orbitron',
        fontSize: '1.5rem',
        letterSpacing: '5px'
      }}>
        INITIALIZING...
      </div>
    );
  }

  // ============================================
  // AUTHENTICATED STATE
  // Show main app if logged in, otherwise show login screen
  // ============================================
  return user ? <Layout /> : <Login />;
};

// ============================================
// ROOT APP COMPONENT
// ============================================
// Sets up context providers hierarchy
// NotificationProvider wraps StoreProvider to access both contexts
// ============================================
function App() {
  return (
    <NotificationProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </NotificationProvider>
  );
}

export default App;
