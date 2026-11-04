// src/App.jsx
import React, { useState, useEffect } from 'react';
import MarketLandingPage from './components/MarketLandingPage';
import SkanviLoginPage from './components/SkanviLoginPage';
import MandiTicker from './components/MandiTicker';
import Navbar from './components/Navbar';
import MarketTerminalPage from './pages/MarketTerminalPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import CropRecommendationPage from './pages/CropRecommendationPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import FloatingCopilotDrawer from './assistant/FloatingCopilotDrawer';
import SearchModal from './components/SearchModal';
import Footer from './components/Footer';
import AestheticTransitionLoader from './components/AestheticTransitionLoader';
import { apiLogout } from './services/api';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Master View: 'landing' (Public Mandi Portal) | 'login' (Dedicated Member Access) | 'app' (Authenticated Platform)
  const [currentView, setCurrentView] = useState('landing');

  // Authenticated Sub-view: 'terminal' (Default) | 'disease' | 'recommendation' | 'transactions' | 'profile'
  const [activeAppView, setActiveAppView] = useState('terminal');

  // Market Terminal Active Tab
  const [mandiTab, setMandiTab] = useState('exchange');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Authentication State
  const [user, setUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Restore authenticated session from localStorage if present
  useEffect(() => {
    const savedUser = localStorage.getItem('agrimart_user');
    const token = localStorage.getItem('agrimart_access_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Ignored
      }
    }
  }, []);

  // The API client emits this when a stored JWT is no longer accepted.
  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      setCurrentView('login');
      setActiveAppView('assistant');
    };

    window.addEventListener('agrimart-auth-expired', handleExpiredSession);
    return () => window.removeEventListener('agrimart-auth-expired', handleExpiredSession);
  }, []);

  // Global Toast Trigger
  const triggerToast = (message) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 3200);
  };

  // Successful Login Handler -> Enters Market Terminal as Default View
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsTransitioning(true);
    setTransitionMessage(`Authenticating Kisan Session for ${userData.name}...`);

    setTimeout(() => {
      setActiveAppView('terminal');
      setCurrentView('app');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 600);

    triggerToast(`Welcome back, ${userData.name}!`);
  };

  // Exit from App back to Public Landing Portal
  const handleExitToLanding = () => {
    setIsTransitioning(true);
    setTransitionMessage('Returning to Public Mandi Portal...');
    setTimeout(() => {
      setCurrentView('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 400);
  };

  // Sign out
  const handleLogout = () => {
    apiLogout();
    setUser(null);
    triggerToast('Signed out of AgriMart Platform');
    handleExitToLanding();
  };

  // View Navigation Handler
  const handleNavigateView = (viewName) => {
    setActiveAppView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for Market Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // VIEW 1: DEDICATED FULL-PAGE LOGIN & REGISTRATION
  if (currentView === 'login') {
    return (
      <>
        {isTransitioning && (
          <AestheticTransitionLoader 
            targetMode="mandi" 
            message={transitionMessage} 
          />
        )}

        <SkanviLoginPage 
          onBackToPortal={() => {
            setIsTransitioning(true);
            setTransitionMessage('Returning to Portal...');
            setTimeout(() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => setIsTransitioning(false), 200);
            }, 300);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // VIEW 2: FLAGSHIP PUBLIC LANDING PORTAL
  if (currentView === 'landing') {
    return (
      <>
        {isTransitioning && (
          <AestheticTransitionLoader 
            targetMode="mandi" 
            message={transitionMessage} 
          />
        )}

        <MarketLandingPage 
          onEnterPlatform={() => {
            setIsTransitioning(true);
            setTransitionMessage('Opening Secure Platform Access...');
            setTimeout(() => {
              setCurrentView('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => setIsTransitioning(false), 200);
            }, 350);
          }} 
        />
      </>
    );
  }

  // VIEW 3: FULL POST-LOGIN PLATFORM
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#121212] selection:bg-[#EBE8E2] selection:text-[#121212] font-sans">
      
      {/* Aesthetic Transition Loader Screen */}
      {isTransitioning && (
        <AestheticTransitionLoader 
          targetMode="mandi" 
          message={transitionMessage} 
        />
      )}

      {/* TOP STRIP: Live Mandi National Ticker */}
      <MandiTicker onOpenMandiTerminal={() => {
        setActiveAppView('terminal');
        setMandiTab('exchange');
      }} />

      {/* Navigation Header */}
      <Navbar 
        user={user}
        onOpenLogin={() => setCurrentView('login')}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        mandiTab={mandiTab}
        onSelectMandiTab={(tab) => {
          setMandiTab(tab);
          setActiveAppView('terminal');
        }}
        onExitToLanding={handleExitToLanding}
        activeAppView={activeAppView}
        onNavigateView={handleNavigateView}
      />

      {/* Floating Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-[#121212] text-white text-xs font-semibold shadow-xl border border-white/10 animate-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* MAIN VIEW: RENDERED BASED ON activeAppView */}
      <main className="flex-1">
        {activeAppView === 'terminal' && (
          <MarketTerminalPage 
            activeTab={mandiTab} 
            onTabChange={setMandiTab} 
            onReturnToAssistant={() => setActiveAppView('terminal')}
          />
        )}

        {activeAppView === 'disease' && (
          <DiseaseDetectionPage
            onNavigateToMarketTerminal={() => {
              setActiveAppView('terminal');
              setMandiTab('exchange');
            }}
            onOpenCopilot={() => {}}
          />
        )}

        {activeAppView === 'recommendation' && (
          <CropRecommendationPage
            onNavigateToMarketTerminal={() => {
              setActiveAppView('terminal');
              setMandiTab('exchange');
            }}
            onOpenCopilot={() => {}}
          />
        )}

        {activeAppView === 'transactions' && (
          <TransactionsPage 
            onReturnToAssistant={() => setActiveAppView('terminal')}
          />
        )}

        {activeAppView === 'profile' && (
          <ProfilePage 
            user={user} 
            onLogout={handleLogout}
            onReturnToAssistant={() => setActiveAppView('terminal')}
          />
        )}
      </main>

      {/* Global Persistent Floating AI Copilot Drawer */}
      <FloatingCopilotDrawer 
        user={user} 
        onNavigateView={handleNavigateView} 
        onSelectMandiTab={(tab) => {
          setMandiTab(tab);
          setActiveAppView('terminal');
        }} 
      />

      {/* Global Commodity & Mandi Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCommodity={() => {
          setMandiTab('exchange');
          setActiveAppView('terminal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <Footer onSelectMandiTab={(tab) => {
        setMandiTab(tab);
        setActiveAppView('terminal');
      }} />

    </div>
  );
}
