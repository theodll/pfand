'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStoredUser, clearStoredUser } from '@/lib/auth';
import Login from '@/components/Login';
import { t } from '@/lib/translations';
import { 
  Wine, 
  LogOut, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Plus, 
  Minus, 
  TrendingUp,
  Trash2,
  Euro,
  ArrowDownToLine,
  History as HistoryIcon
} from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  bottles?: number;
  type: 'deposit' | 'withdrawal';
  user_id?: string;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [count, setCount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [pendingWithdrawAmount, setPendingWithdrawAmount] = useState(0);
  const [modalBottleCount, setModalBottleCount] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const PFAND_VALUE = 0.25; // Standard Einweg pfand

  // Check for stored user on mount
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Load transactions from Supabase when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser]);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    setTransactions([]);
    setCount(0);
    setWithdrawAmount('');
  };

  const loadTransactions = async () => {
    if (!currentUser) return;
    
    // If supabase is not configured, use localStorage only
    if (!supabase) {
      const saved = localStorage.getItem('pfandTransactions_shared');
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
      setIsOnline(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading from Supabase:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('pfandTransactions_shared');
        if (saved) {
          setTransactions(JSON.parse(saved));
        }
        setIsOnline(false);
      } else if (data) {
        setTransactions(data);
        // Sync to localStorage as backup
        localStorage.setItem('pfandTransactions_shared', JSON.stringify(data));
        setIsOnline(true);
      }
    } catch (err) {
      console.error('Error connecting to Supabase:', err);
      // Fallback to localStorage
      const saved = localStorage.getItem('pfandTransactions_shared');
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
      setIsOnline(false);
    }
  };

  const addPfand = async (amount: number) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      amount: amount * PFAND_VALUE,
      bottles: amount,
      type: 'deposit',
      user_id: currentUser || undefined,
    };

    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem('pfandTransactions_shared', JSON.stringify(newTransactions));
    setCount(0);

    // Sync to Supabase if available
    if (!supabase) {
      setIsOnline(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([newTransaction]);
      
      if (error) {
        console.error('Error syncing to Supabase:', error);
        setIsOnline(false);
      } else {
        setIsOnline(true);
      }
    } catch (err) {
      console.error('Error connecting to Supabase:', err);
      setIsOnline(false);
    }
  };

  const withdraw = (amount: number) => {
    if (balance < amount || amount <= 0) return;
    
    // Calculate how many bottles this amount represents
    const bottlesWithdrawn = Math.round(amount / PFAND_VALUE);
    
    // Show modal to inform user how many bottles to take out
    setPendingWithdrawAmount(amount);
    setModalBottleCount(bottlesWithdrawn.toString());
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    const bottlesWithdrawn = parseInt(modalBottleCount) || 0;
    
    if (bottlesWithdrawn <= 0 || bottlesWithdrawn > totalBottles) {
      alert(t('invalidBottles').replace('{max}', Math.floor(totalBottles).toString()));
      return;
    }
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      amount: pendingWithdrawAmount,
      bottles: bottlesWithdrawn,
      type: 'withdrawal',
      user_id: currentUser || undefined,
    };

    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem('pfandTransactions_shared', JSON.stringify(newTransactions));
    setWithdrawAmount('');
    setShowWithdrawModal(false);
    setPendingWithdrawAmount(0);
    setModalBottleCount('');

    // Sync to Supabase if available
    if (!supabase) {
      setIsOnline(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([newTransaction]);
      
      if (error) {
        console.error('Error syncing to Supabase:', error);
        setIsOnline(false);
      } else {
        setIsOnline(true);
      }
    } catch (err) {
      console.error('Error connecting to Supabase:', err);
      setIsOnline(false);
    }
  };

  const clearHistory = async () => {
    if (confirm(t('clearHistoryConfirm'))) {
      setTransactions([]);
      localStorage.removeItem('pfandTransactions_shared');
      
      // Clear from Supabase if available
      if (!supabase) return;
      
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .neq('id', ''); // Delete all rows
        
        if (error) {
          console.error('Error clearing Supabase:', error);
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
    }
  };

  const resetAll = async () => {
    if (confirm(t('resetConfirm'))) {
      setTransactions([]);
      setCount(0);
      setWithdrawAmount('');
      localStorage.removeItem('pfandTransactions_shared');
      
      // Clear from Supabase if available
      if (!supabase) return;
      
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .neq('id', ''); // Delete all rows
        
        if (error) {
          console.error('Error clearing Supabase:', error);
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
    }
  };

  const balance = transactions.reduce((sum, t) => 
    t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0
  );
  
  const totalBottles = transactions.reduce((sum, t) => {
    const bottles = t.bottles || (t.amount / PFAND_VALUE);
    return t.type === 'deposit' ? sum + bottles : sum - bottles;
  }, 0);

  // Get daily bottle counts for the last 7 days
  const getDailyBottles = () => {
    const days = 7;
    const dailyData: { date: string; bottles: number }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      
      const bottlesOnDay = transactions
        .filter(t => t.type === 'deposit' && t.date.startsWith(dateString))
        .reduce((sum, t) => sum + (t.amount / PFAND_VALUE), 0);
      
      dailyData.push({ date: dateString, bottles: bottlesOnDay });
    }
    
    return dailyData;
  };

  const dailyBottles = getDailyBottles();
  const maxBottles = Math.max(...dailyBottles.map(d => d.bottles), 1);

  // Show login screen if not logged in
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <Wine className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {t('title')}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('welcome')}, <span className="font-semibold text-gray-900 dark:text-gray-100">{currentUser}</span>
                    </p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isOnline 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {isOnline ? t('synced') : t('offline')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('reset')}
                  </button>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {t('totalBalance')}
                </div>
                <div className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {balance.toFixed(2)}€
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Wine className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                    {totalBottles} {t('bottles')}
                  </span>
                </div>
              </div>
            </div>

            {/* Counter Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('addBottles')}
              </h2>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setCount(Math.max(0, count - 1))}
                  className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                    {count}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {(count * PFAND_VALUE).toFixed(2)}€
                  </div>
                </div>
                
                <button
                  onClick={() => setCount(count + 1)}
                  className="w-16 h-16 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[5, 10, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setCount(count + num)}
                    className="py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => count > 0 && addPfand(count)}
                disabled={count === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
              >
                {count > 0 ? t('addCount').replace('{count}', count.toString()).replace('{bottles}', count === 1 ? t('bottle') : t('bottles')) : t('enterAmount')}
              </button>
            </div>

            {/* Cash Out */}
            {balance > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t('cashOut')}
                </h2>
                
                {/* Custom Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('customAmount')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={balance}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-red-500 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => {
                        const amount = parseFloat(withdrawAmount);
                        if (!isNaN(amount) && amount > 0) {
                          withdraw(amount);
                        }
                      }}
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                      className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ArrowDownToLine className="w-5 h-5" />
                      {t('withdraw')}
                    </button>
                  </div>
                </div>

                {/* Quick Amounts */}
                {balance >= 5 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('quickAmounts')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[5, 10, 20].filter(amount => amount <= balance).map(amount => (
                        <button
                          key={amount}
                          onClick={() => withdraw(amount)}
                          className="py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 active:scale-95 transition-all"
                        >
                          {amount}€
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transaction History - Mobile Only */}
            <div className="lg:hidden bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {t('history')}
                  </h2>
                </div>
                {transactions.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {t('clear')}
                  </button>
                )}
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wine className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('noTransactions')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {transaction.date}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {transaction.type === 'deposit' 
                            ? `${transaction.amount / PFAND_VALUE} ${t('bottles')}` 
                            : t('cashedOut')}
                          {transaction.user_id && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              • {transaction.user_id}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'deposit' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '−'}
                        {transaction.amount.toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Graph & History (Desktop/Tablet Only) */}
          <div className="hidden lg:block space-y-6">
            {/* Graph */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t('last7Days')}
                </h2>
              </div>
              <div className="flex items-end justify-between gap-2 h-48">
                {dailyBottles.map((day, index) => {
                  const height = maxBottles > 0 ? (day.bottles / maxBottles) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end flex-1">
                        {day.bottles > 0 && (
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            {day.bottles}
                          </div>
                        )}
                        <div 
                          className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300 hover:bg-emerald-600"
                          style={{ height: `${Math.max(height, day.bottles > 0 ? 10 : 0)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {day.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {t('transactionHistory')}
                  </h2>
                </div>
                {transactions.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {t('clearAll')}
                  </button>
                )}
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Wine className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('noTransactions')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {transaction.date}
                        </div>
                        <div className="flex items-center gap-2">
                          {transaction.type === 'deposit' ? (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                              <Wine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                              <Euro className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {transaction.type === 'deposit' 
                                ? `${transaction.amount / PFAND_VALUE} ${t('bottles')}` 
                                : t('cashedOut')}
                            </span>
                            {transaction.user_id && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {t('by')} {transaction.user_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'deposit' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '−'}
                        {transaction.amount.toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('withdrawing')} {pendingWithdrawAmount.toFixed(2)}€
            </h2>
            
            <div className="mb-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {t('pleaseTakeOut')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Wine className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {modalBottleCount} {t('bottles')}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                {t('calculation')
                  .replace('{amount}', pendingWithdrawAmount.toFixed(2))
                  .replace('{bottles}', modalBottleCount)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setPendingWithdrawAmount(0);
                  setModalBottleCount('');
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmWithdraw}
                className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
