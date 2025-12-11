'use client';

import { useState } from 'react';
import { validateUser, setStoredUser, USERS } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { t } from '@/lib/translations';
import { Wine, Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [showKeys, setShowKeys] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !key) {
      setError(t('enterBothFields'));
      return;
    }

    if (validateUser(name, key)) {
      setStoredUser(name.toLowerCase());
      onLogin(name.toLowerCase());
    } else {
      setError(t('invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors flex items-center gap-2"
            title={theme === 'light' ? t('darkTheme') : t('lightTheme')}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
            <Wine className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('loginTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loginSubtitle')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('accessKeyLabel')}
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={t('accessKeyPlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {t('signInButton')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-2"
            >
              {showKeys ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  {t('hideKeysButton')}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  {t('showKeysButton')}
                </>
              )}
            </button>
            
            {showKeys && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t('devKeysTitle')}
                </p>
                {USERS.map((user) => (
                  <div key={user.name} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {user.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 break-all">
                      {user.key}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
