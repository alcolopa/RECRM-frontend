import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type NavigationTab = 'dashboard' | 'properties' | 'contacts' | 'deals' | 'leads' | 'profile' | 'organization' | 'offers' | 'offer-details';

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
  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');
  const [navigationState, setNavigationState] = useState<NavigationState>({});

  const navigate = (tab: NavigationTab, state?: NavigationState) => {
    setActiveTabState(tab);
    if (state) {
      setNavigationState(state);
    }
  };

  const clearNavigationState = () => {
    setNavigationState({});
  };

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
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
