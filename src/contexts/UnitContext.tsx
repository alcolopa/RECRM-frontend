import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../api/users';
import { userService } from '../api/users';
import { sqmToSqft, sqftToSqm, formatArea } from '../utils/unitConversion';

type UnitType = 'METRIC' | 'IMPERIAL';

interface UnitContextType {
  unit: UnitType;
  setUnit: (unit: UnitType) => Promise<void>;
  displayAreaValue: (sqmValue: number) => number;
  displayAreaLabel: string;
  convertToSqm: (value: number) => number;
  formatAreaDisplay: (sqmValue: number) => string;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode; user?: UserProfile | null }> = ({ children, user }) => {
  const [unit, setUnitState] = useState<UnitType>(user?.unitPreference || 'METRIC');

  useEffect(() => {
    if (user?.unitPreference) {
      setUnitState(user.unitPreference);
    }
  }, [user?.unitPreference]);

  const setUnit = async (newUnit: UnitType) => {
    try {
      await userService.updateMe({ unitPreference: newUnit });
      setUnitState(newUnit);
    } catch (error) {
      console.error('Failed to update unit preference', error);
      // Fallback or error handling
    }
  };

  const displayAreaValue = (sqmValue: number) => {
    if (unit === 'IMPERIAL') {
      return sqmToSqft(sqmValue);
    }
    return sqmValue;
  };

  const convertToSqm = (value: number) => {
    if (unit === 'IMPERIAL') {
      return sqftToSqm(value);
    }
    return value;
  };

  const formatAreaDisplay = (sqmValue: number) => {
    const value = displayAreaValue(sqmValue);
    return formatArea(value, unit);
  };

  const displayAreaLabel = unit === 'METRIC' ? 'sqm' : 'sqft';

  return (
    <UnitContext.Provider value={{
      unit,
      setUnit,
      displayAreaValue,
      displayAreaLabel,
      convertToSqm,
      formatAreaDisplay
    }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
};
