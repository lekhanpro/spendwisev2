import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AppContext } from './AppContext';

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive' | null;

export interface FinanceContextType {
  monthlySavings: number;
  monthlyIncome: number;
  riskProfile: RiskProfile;
  setRiskProfile: (profile: RiskProfile) => void;
  shortlistedSchemes: string[];
  toggleShortlist: (schemeId: string) => void;
  trackedStocks: string[];
  toggleTrackedStock: (stockId: string) => void;
  learnProgress: Record<string, boolean>;
  updateLearnProgress: (topicId: string, completed: boolean) => void;
  learnStreak: number;
  updateLearnStreak: () => void;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const appContext = useContext(AppContext);
  const [riskProfile, setRiskProfileState] = useState<RiskProfile>(null);
  const [shortlistedSchemes, setShortlistedSchemes] = useState<string[]>([]);
  const [trackedStocks, setTrackedStocks] = useState<string[]>([]);
  const [learnProgress, setLearnProgress] = useState<Record<string, boolean>>({});
  const [learnStreak, setLearnStreak] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedRiskProfile = localStorage.getItem('spendwise_risk_profile');
    if (savedRiskProfile) {
      setRiskProfileState(savedRiskProfile as RiskProfile);
    }

    const savedShortlist = localStorage.getItem('spendwise_shortlisted_schemes');
    if (savedShortlist) {
      setShortlistedSchemes(JSON.parse(savedShortlist));
    }

    const savedTracked = localStorage.getItem('spendwise_tracked_stocks');
    if (savedTracked) {
      setTrackedStocks(JSON.parse(savedTracked));
    }

    const savedProgress = localStorage.getItem('spendwise_learn_progress');
    if (savedProgress) {
      setLearnProgress(JSON.parse(savedProgress));
    }

    const savedStreak = localStorage.getItem('spendwise_learn_streak');
    const savedLastVisit = localStorage.getItem('spendwise_learn_last_visit');
    if (savedStreak && savedLastVisit) {
      const lastVisit = new Date(savedLastVisit);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        setLearnStreak(parseInt(savedStreak));
      } else if (daysDiff === 1) {
        setLearnStreak(parseInt(savedStreak));
      } else {
        setLearnStreak(0);
        localStorage.setItem('spendwise_learn_streak', '0');
      }
    }
  }, []);

  // Calculate monthly savings and income from transactions
  const { monthlySavings, monthlyIncome } = React.useMemo(() => {
    if (!appContext) return { monthlySavings: 0, monthlyIncome: 0 };

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

    const monthlyTransactions = appContext.transactions.filter(
      t => t.date >= monthStart && t.date <= monthEnd
    );

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      monthlyIncome: income,
      monthlySavings: income - expenses
    };
  }, [appContext?.transactions]);

  const setRiskProfile = (profile: RiskProfile) => {
    setRiskProfileState(profile);
    if (profile) {
      localStorage.setItem('spendwise_risk_profile', profile);
    }
  };

  const toggleShortlist = (schemeId: string) => {
    const updated = shortlistedSchemes.includes(schemeId)
      ? shortlistedSchemes.filter(id => id !== schemeId)
      : [...shortlistedSchemes, schemeId];
    setShortlistedSchemes(updated);
    localStorage.setItem('spendwise_shortlisted_schemes', JSON.stringify(updated));
  };

  const toggleTrackedStock = (stockId: string) => {
    const updated = trackedStocks.includes(stockId)
      ? trackedStocks.filter(id => id !== stockId)
      : [...trackedStocks, stockId];
    setTrackedStocks(updated);
    localStorage.setItem('spendwise_tracked_stocks', JSON.stringify(updated));
  };

  const updateLearnProgress = (topicId: string, completed: boolean) => {
    const updated = { ...learnProgress, [topicId]: completed };
    setLearnProgress(updated);
    localStorage.setItem('spendwise_learn_progress', JSON.stringify(updated));
  };

  const updateLearnStreak = () => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('spendwise_learn_last_visit');
    
    if (lastVisit !== today) {
      const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date(0);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let newStreak = learnStreak;
      if (daysDiff === 1) {
        newStreak = learnStreak + 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
      
      setLearnStreak(newStreak);
      localStorage.setItem('spendwise_learn_streak', newStreak.toString());
      localStorage.setItem('spendwise_learn_last_visit', today);
    }
  };

  const contextValue: FinanceContextType = {
    monthlySavings,
    monthlyIncome,
    riskProfile,
    setRiskProfile,
    shortlistedSchemes,
    toggleShortlist,
    trackedStocks,
    toggleTrackedStock,
    learnProgress,
    updateLearnProgress,
    learnStreak,
    updateLearnStreak
  };

  return <FinanceContext.Provider value={contextValue}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};
