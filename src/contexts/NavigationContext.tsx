import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type NavigationTab = 
  | 'dashboard' 
  | 'properties' 
  | 'contacts' 
  | 'deals' 
  | 'leads' 
  | 'profile' 
  | 'organization' 
  | 'offers' 
  | 'offer-details' 
  | 'tasks' 
  | 'calendar';

interface NavigationState {
  returnTo?: NavigationTab;
  draftData?: any;
  prefillData?: any;
  context?: string; // e.g., 'creating-seller'
}

interface NavigationContextType {
  activeTab: NavigationTab;
  navigationState: NavigationState;
  navigate: (tab: NavigationTab, state?: NavigationState) => void;
  clearNavigationState: () => void;
  setActiveTab: (tab: NavigationTab) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from URL if possible
  const getTabFromUrl = (): NavigationTab => {
    const path = window.location.pathname.replace(/^\//, '');
    const validTabs: NavigationTab[] = [
      'dashboard', 'properties', 'contacts', 'deals', 'leads', 
      'profile', 'organization', 'offers', 'offer-details', 
      'tasks', 'calendar'
    ];
    return (validTabs.find(t => t === path) || 'dashboard') as NavigationTab;
  };

  const [activeTab, setActiveTabState] = useState<NavigationTab>(getTabFromUrl);
  const [navigationState, setNavigationState] = useState<NavigationState>({});

  // Sync with browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (tab: NavigationTab) => {
    if (window.location.pathname !== `/${tab}`) {
      window.history.pushState({}, '', `/${tab}`);
    }
  };

  const navigate = (tab: NavigationTab, state?: NavigationState) => {
    setActiveTabState(tab);
    updateUrl(tab);
    if (state) {
      setNavigationState(state);
    }
  };

  const clearNavigationState = () => {
    setNavigationState({});
  };

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    updateUrl(tab);
  };

  return (
    <NavigationContext.Provider value={{ 
      activeTab, 
      navigationState, 
      navigate, 
      clearNavigationState,
      setActiveTab
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
