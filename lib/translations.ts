// Translation system for Pfand Tracker

export type Language = 'en' | 'de';

interface Translations {
  // Login
  loginTitle: string;
  loginSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  accessKeyLabel: string;
  accessKeyPlaceholder: string;
  signInButton: string;
  showKeysButton: string;
  hideKeysButton: string;
  devKeysTitle: string;
  invalidCredentials: string;
  enterBothFields: string;

  // Header
  title: string;
  welcome: string;
  logout: string;
  reset: string;
  synced: string;
  offline: string;

  // Balance Card
  totalBalance: string;
  bottles: string;
  bottle: string;

  // Counter Section
  addBottles: string;
  enterAmount: string;
  addCount: string;

  // Cash Out
  cashOut: string;
  customAmount: string;
  withdraw: string;
  quickAmounts: string;

  // Transaction History
  history: string;
  transactionHistory: string;
  clear: string;
  clearAll: string;
  noTransactions: string;
  cashedOut: string;
  by: string;
  deposited: string;
  withdrew: string;

  // Graph
  last7Days: string;

  // Withdraw Modal
  withdrawing: string;
  pleaseTakeOut: string;
  cancel: string;
  confirm: string;
  calculation: string;

  // Alerts
  clearHistoryConfirm: string;
  resetConfirm: string;
  invalidBottles: string;

  // Theme
  lightTheme: string;
  darkTheme: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Login
    loginTitle: 'Pfand Tracker',
    loginSubtitle: 'Sign in to track your bottles',
    nameLabel: 'Name',
    namePlaceholder: 'Enter your name',
    accessKeyLabel: 'Access Key',
    accessKeyPlaceholder: 'Enter your access key',
    signInButton: 'Sign In',
    showKeysButton: 'Show Access Keys',
    hideKeysButton: 'Hide Access Keys',
    devKeysTitle: 'Development Keys (for testing):',
    invalidCredentials: 'Invalid name or key',
    enterBothFields: 'Please enter both name and key',

    // Header
    title: 'Pfand Tracker',
    welcome: 'Welcome',
    logout: 'Logout',
    reset: 'Reset',
    synced: 'Synced',
    offline: 'Offline',

    // Balance Card
    totalBalance: 'Total Balance',
    bottles: 'bottles',
    bottle: 'bottle',

    // Counter Section
    addBottles: 'Add Bottles',
    enterAmount: 'Enter amount',
    addCount: 'Add {count} {bottles}',

    // Cash Out
    cashOut: 'Cash Out',
    customAmount: 'Custom Amount',
    withdraw: 'Withdraw',
    quickAmounts: 'Quick Amounts',

    // Transaction History
    history: 'History',
    transactionHistory: 'Transaction History',
    clear: 'Clear',
    clearAll: 'Clear All',
    noTransactions: 'No transactions yet',
    cashedOut: 'Cashed out',
    deposited: 'Deposited',
    withdrew: 'Withdrew',
    by: 'by',

    // Graph
    last7Days: 'Last 7 Days',

    // Withdraw Modal
    withdrawing: 'Withdrawing',
    pleaseTakeOut: 'Please take out:',
    cancel: 'Cancel',
    confirm: 'Confirm',
    calculation: '({amount}€ ÷ 0.25€ = {bottles} bottles)',

    // Alerts
    clearHistoryConfirm: 'Clear all transaction history?',
    resetConfirm: 'Reset everything? This will clear all data.',
    invalidBottles: 'Please enter a valid number of bottles (0-{max})',

    // Theme
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
  },
  de: {
    // Login
    loginTitle: 'Pfand Tracker',
    loginSubtitle: 'Anmelden um Flaschen zu verfolgen',
    nameLabel: 'Name',
    namePlaceholder: 'Gib deinen Namen ein',
    accessKeyLabel: 'Zugangscode',
    accessKeyPlaceholder: 'Gib deinen Zugangscode ein',
    signInButton: 'Anmelden',
    showKeysButton: 'Zugangscodes anzeigen',
    hideKeysButton: 'Zugangscodes verbergen',
    devKeysTitle: 'Entwicklungsschlüssel (zum Testen):',
    invalidCredentials: 'Ungültiger Name oder Schlüssel',
    enterBothFields: 'Bitte Name und Schlüssel eingeben',

    // Header
    title: 'Pfand Tracker',
    welcome: 'Willkommen',
    logout: 'Abmelden',
    reset: 'Zurücksetzen',
    synced: 'Synchronisiert',
    offline: 'Offline',

    // Balance Card
    totalBalance: 'Gesamtguthaben',
    bottles: 'Flaschen',
    bottle: 'Flasche',

    // Counter Section
    addBottles: 'Flaschen hinzufügen',
    enterAmount: 'Anzahl eingeben',
    addCount: '{count} {bottles} hinzufügen',

    // Cash Out
    cashOut: 'Auszahlen',
    customAmount: 'Eigener Betrag',
    withdraw: 'Abheben',
    quickAmounts: 'Schnellbeträge',

    // Transaction History
    history: 'Verlauf',
    transactionHistory: 'Transaktionsverlauf',
    clear: 'Löschen',
    clearAll: 'Alles löschen',
    noTransactions: 'Noch keine Transaktionen',
    cashedOut: 'Ausgezahlt',
    deposited: 'Eingezahlt',
    withdrew: 'Abgehoben',
    by: 'von',

    // Graph
    last7Days: 'Letzte 7 Tage',

    // Withdraw Modal
    withdrawing: 'Auszahlung',
    pleaseTakeOut: 'Bitte herausnehmen:',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    calculation: '({amount}€ ÷ 0,25€ = {bottles} Flaschen)',

    // Alerts
    clearHistoryConfirm: 'Gesamte Transaktionshistorie löschen?',
    resetConfirm: 'Alles zurücksetzen? Dies löscht alle Daten.',
    invalidBottles: 'Bitte gib eine gültige Anzahl an Flaschen ein (0-{max})',

    // Theme
    lightTheme: 'Helles Design',
    darkTheme: 'Dunkles Design',
  },
};

export const getLanguage = (): Language => {
  const lang = process.env.NEXT_PUBLIC_LANGUAGE as Language;
  return lang === 'de' ? 'de' : 'en';
};

export const t = (key: keyof Translations): string => {
  const language = getLanguage();
  return translations[language][key];
};

export default translations;
