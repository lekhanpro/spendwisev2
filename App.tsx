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

  // Firebase user instead of Supabase session
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
      <div style={{ padding: 24 }}>
        <h2>Spendwise</h2>
        <p>Checking login...</p>
      </div>
    );
  }

  // If NO Firebase user → show login screen
  if (!firebaseUser) {
    return <Auth />;
  }

  // If user exists but email is NOT verified → show verification message
  if (!firebaseUser.emailVerified) {
    return (
      <div style={{ padding: 24, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <h2>Email Verification Required</h2>
        <p>Please check your email and click the verification link to access your account.</p>
        <p style={{ color: '#666', fontSize: 14 }}>
          Email: <strong>{firebaseUser.email}</strong>
        </p>
        <button
          onClick={async () => {
            await auth.signOut();
            setFirebaseUser(null);
          }}
          style={{
            marginTop: 16,
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
        <p style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
          After verifying your email, please sign in again.
        </p>
      </div>
    );
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

