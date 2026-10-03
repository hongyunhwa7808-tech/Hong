/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { AddEntryView } from './components/AddEntryView';
import { HomeView } from './components/HomeView';
import { HistoryView } from './components/HistoryView';
import { AssetsView } from './components/AssetsView';
import { BudgetsView } from './components/BudgetsView';
import { SettingsModal } from './components/SettingsModal';
import {
  Transaction,
  Account,
  BudgetGoal,
  AppSettings,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
} from './utils';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('add-entry');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Persistent storage in localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('hk_ledger_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('hk_ledger_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('hk_ledger_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<BudgetGoal[]>(() => {
    const saved = localStorage.getItem('hk_ledger_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('hk_ledger_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('hk_ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hk_ledger_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('hk_ledger_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Handlers
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const now = new Date();
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      createdAt: now.toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update last updated in settings
    const updatedTime = `${txData.date} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    setSettings((prev) => ({ ...prev, lastUpdated: updatedTime }));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateAccountBalance = (id: string, newBalance: number) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, balance: newBalance } : acc))
    );
  };

  const handleAddAccount = (newAcc: Omit<Account, 'id'>) => {
    setAccounts((prev) => [...prev, { ...newAcc, id: 'acc-' + Date.now() }]);
  };

  const handleUpdateBudget = (groupName: string, newAmount: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.groupName === groupName ? { ...b, monthlyMnt: newAmount } : b))
    );
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setBudgets(INITIAL_BUDGETS);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <div className="min-h-screen max-w-[520px] mx-auto flex flex-col relative shadow-[0_1px_8px_rgba(0,0,0,0.04)] bg-surface">
      {/* Fixed Header */}
      <Header
        title={settings.title}
        lastUpdated={settings.lastUpdated}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col w-full px-margin pt-16 pb-24 bg-surface min-h-[calc(100vh-4rem)]">
        {currentTab === 'add-entry' && (
          <AddEntryView
            mntToKrwRate={settings.mntToKrwRate}
            onSaveTransaction={handleSaveTransaction}
          />
        )}

        {currentTab === 'home' && (
          <HomeView
            transactions={transactions}
            budgets={budgets}
            mntToKrwRate={settings.mntToKrwRate}
            onNavigateToAdd={() => setCurrentTab('add-entry')}
            onNavigateToHistory={() => setCurrentTab('history')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'assets' && (
          <AssetsView
            accounts={accounts}
            mntToKrwRate={settings.mntToKrwRate}
            onUpdateAccountBalance={handleUpdateAccountBalance}
            onAddAccount={handleAddAccount}
          />
        )}

        {currentTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            transactions={transactions}
            mntToKrwRate={settings.mntToKrwRate}
            onUpdateBudget={handleUpdateBudget}
          />
        )}
      </main>

      {/* Fixed Bottom Dock Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSaveSettings={setSettings}
          onResetData={handleResetData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
