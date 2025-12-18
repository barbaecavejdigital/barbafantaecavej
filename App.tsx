import React, { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { initData, getCurrentUser, logout, getUserById } from './services/dataService';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import InitialSetup from './components/customer/InitialSetup';
import ToastContainer from './components/shared/ToastContainer';
import AdminSidebar from './components/admin/AdminSidebar';
import Header from './components/shared/Header';
import { ToastData } from './types';
import HomePage from './components/HomePage';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'app'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initData();
        
        // Load user from local storage
        const localUser = getCurrentUser();
        
        if (localUser) {
           // RE-VALIDATION: Check if user actually exists in DB and get fresh data (e.g. points)
           // This prevents stale data issues if points were changed by admin on another device
           const freshUser = await getUserById(localUser.id);
           
           if (freshUser) {
               setCurrentUser(freshUser);
               // If roles or essential data mismatch, update local storage implicitly via login flow logic
               // but for now setting state is enough to show correct UI
           } else {
               // User deleted from DB or invalid
               logout();
               setCurrentUser(null);
           }
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
        showToast("Errore di connessione al database.", 'error');
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, [showToast]);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentUser(null);
    showToast('Logout effettuato con successo.');
  }, [showToast]);

  const handleInitialSetupComplete = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const navigateToApp = useCallback(() => setCurrentView('app'), []);
  const navigateToHome = useCallback(() => setCurrentView('home'), []);

  const renderAppContent = () => {
    if (isInitializing) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#f2f2f7]">
          <div className="text-center animate-fade-in">
            <svg className="mx-auto h-12 w-12 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-700">Inizializzazione...</h2>
            <p className="text-gray-500 text-sm">Connessione al database in corso.</p>
          </div>
        </div>
      );
    }
    
    if (!currentUser) {
      return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 custom-scrollbar">
           <LoginPage onLoginSuccess={handleLoginSuccess} showToast={showToast} onNavigateToHome={navigateToHome} />
        </div>
      );
    }

    if (currentUser.role === 'admin') {
      return (
        <div className="flex flex-col h-full w-full bg-[#f2f2f7] overflow-hidden">
          <AdminSidebar user={currentUser} onLogout={handleLogout} showToast={showToast} />
          {/* Main content area for admin - independent scroll handled inside dashboard */}
          <main className="flex-1 min-h-0 relative">
            <AdminDashboard user={currentUser} showToast={showToast} />
          </main>
        </div>
      );
    }

    // CUSTOMER LAYOUT - Fixed Shell
    return (
      <div className="flex flex-col h-full w-full bg-[#f2f2f7] overflow-hidden">
        {/* Header is static (flex item), not sticky, so it doesn't fight with content scroll */}
        <div className="flex-shrink-0 z-50 relative">
            <Header user={currentUser} onLogout={handleLogout} />
        </div>
        
        {/* Main Content scrolls INDEPENDENTLY */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar relative scroll-smooth">
          {currentUser.isInitialLogin ? (
            <InitialSetup user={currentUser} onComplete={handleInitialSetupComplete} showToast={showToast} />
          ) : (
            <CustomerDashboard user={currentUser} />
          )}
        </main>
      </div>
    );
  };

  return (
    <>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      {currentView === 'home' ? (
        <div className="h-full w-full overflow-y-auto bg-[#f2f2f7] custom-scrollbar">
            <HomePage onNavigateToLogin={navigateToApp} />
        </div>
      ) : (
        <div className="h-full w-full overflow-hidden">
            {renderAppContent()}
        </div>
      )}
    </>
  );
}

export default App;