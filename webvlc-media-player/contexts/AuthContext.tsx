import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    // Simulated login
    setUser({
      id: 'u1',
      name: 'Demo User',
      email: 'user@example.com',
      isAuthenticated: true,
      avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=FF8800&color=fff&size=128'
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};