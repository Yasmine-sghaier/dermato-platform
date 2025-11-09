
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  role: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (token && userRole && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsLoggedIn(true);
        setRole(userRole);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setRole(userData.role);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};