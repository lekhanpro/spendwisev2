import React, { useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AppProvider, AppContext } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { InvestmentProvider } from './context/InvestmentContext';
import { auth } from './lib/auth';
import { Auth } from './components/Auth';
import { Bills } from './components/Bills';
import { BudgetView } from './components/BudgetView';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { Layout } from './components/Layout';
import { Modal } from './components/Modal';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { TransactionForm } from './components/TransactionForm';
import { Transactions } from './components/Transactions';
import { InvestPage } from './pages/invest/InvestPage';

const MainContent: React.FC = () => {
  const {
    activeView,
    showTransactionModal,
    setShowTransactionModal,
    editingTransaction,
    addTransaction,
    updateTransaction,
    setEditingTransaction,
  } = useContext(AppContext)!;

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Auth />;
  }

  if (!firebaseUser.emailVerified) {
    auth.signOut();
    return <Auth />;
  }

  const handleSaveTransaction = (transaction: any) => {
    if (editingTransaction) {
      updateTransaction(transaction);
    } else {
      addTransaction(transaction);
    }
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  return (
    <Layout>
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'transactions' && <Transactions />}
      {activeView === 'budget' && <BudgetView />}
      {activeView === 'reports' && <Reports />}
      {activeView === 'bills' && <Bills />}
      {activeView === 'goals' && <Goals />}
      {activeView === 'settings' && <Settings />}
      {activeView === 'invest' && <InvestPage />}

      <Modal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
        />
      </Modal>
    </Layout>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <NotificationProvider>
      <InvestmentProvider>
        <MainContent />
      </InvestmentProvider>
    </NotificationProvider>
  </AppProvider>
);

export default App;
