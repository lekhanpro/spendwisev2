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
import { LandingPage } from "./components/LandingPage";

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
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if we're on the Vercel app (simple check by hostname or just default behavior)
    // For now, we'll show landing page initially unless user is logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user) {
        setShowLanding(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // If user clicks "Launch App" from landing page, we can handle it here
  // But since we are linking to the Vercel URL, this logic is mainly for the Vercel deployment itself
  // or if they use the same domain.

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If on Landing Page mode and not logged in
  if (showLanding && !firebaseUser) {
    return (
      <>
        <LandingPage />
        {/* Hidden login trigger for internal navigation if needed */}
        {/* <button onClick={() => setShowLanding(false)} className="fixed bottom-4 right-4 opacity-0">Login</button> */}
      </>
    );
  }

  // If NO Firebase user → show login screen (when they click "Launch App" or navigate)
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

