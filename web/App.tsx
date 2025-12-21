// App.tsx
import React, { useContext, useEffect, useState } from "react";
import { AppProvider, AppContext } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { BudgetView } from "./components/BudgetView";
import { Reports } from "./components/Reports";
import { Goals } from "./components/Goals";
import { Settings } from "./components/Settings";
import { Modal } from "./components/Modal";
import { TransactionForm } from "./components/TransactionForm";
import { Auth } from "./components/Auth";
import { AIChatbot } from "./components/AIChatbot";


// Firebase imports
import { auth } from "./lib/auth";
import { onAuthStateChanged, type User } from "firebase/auth";

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

  // If auth is still verifying
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If NO Firebase user → show login screen
  if (!firebaseUser) {
    return <Auth />;
  }



  // If user exists but email is NOT verified → sign them out and show Auth
  if (!firebaseUser.emailVerified) {
    auth.signOut();
    return <Auth />;
  }

  // Otherwise, render original UI
  const handleSaveTransaction = (t: any) => {
    if (editingTransaction) {
      updateTransaction(t);
    } else {
      addTransaction(t);
    }
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  return (
    <Layout>
      {activeView === "dashboard" && <Dashboard />}
      {activeView === "transactions" && <Transactions />}
      {activeView === "budget" && <BudgetView />}
      {activeView === "reports" && <Reports />}
      {activeView === "goals" && <Goals />}
      {activeView === "settings" && <Settings />}

      <Modal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
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

      {/* AI Chatbot FAB */}
      <AIChatbot />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;

