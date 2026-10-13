import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Role } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users - will be replaced by API
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    email: 'admin@procom.test',
    phone: '081234567890',
    role: 'admin',
    position: 'Administrator',
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    email: 'cashier@procom.test',
    phone: '081234567891',
    role: 'cashier',
    position: 'Kasir',
  },
  {
    id: 3,
    name: 'Budi Santoso',
    email: 'owner@procom.test',
    phone: '081234567892',
    role: 'owner',
    position: 'Pemilik',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('procom_user');

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem('procom_user');
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);

      // Password is currently not validated because this is still mock authentication.
      void password;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const found = MOCK_USERS.find(
        (u) => u.email === email.toLowerCase()
      );

      if (found) {
        setUser(found);
        localStorage.setItem('procom_user', JSON.stringify(found));
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('procom_user');
  }, []);

  const hasRole = useCallback(
    (roles: Role | Role[]) => {
      if (!user) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];

      return roleArray.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}