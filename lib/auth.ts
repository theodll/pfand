// Simple key-based authentication system
export interface User {
  name: string;
  key: string;
}

// Hardcoded user accounts with pre-generated keys
export const USERS: User[] = [
  { name: 'leander', key: 'pfand-leander-2024-key' },
  { name: 'theo', key: 'pfand-theo-2024-key' },
  { name: 'evan', key: 'pfand-evan-2024-key' },
  { name: 'ronon', key: 'pfand-ronon-2024-key' },
];

export const validateUser = (name: string, key: string): boolean => {
  const user = USERS.find(u => u.name.toLowerCase() === name.toLowerCase());
  return user ? user.key === key : false;
};

export const getStoredUser = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pfand_user');
  }
  return null;
};

export const setStoredUser = (name: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pfand_user', name);
  }
};

export const clearStoredUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pfand_user');
  }
};
