// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'patient' | 'secretary' | 'dermatologist';
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userData = localStorage.getItem('user');

    if (token && role && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isPatient = user?.role === 'patient';
  const isSecretary = user?.role === 'secretary';
  const isDermatologist = user?.role === 'dermatologist';

  return {
    user,
    loading,
    isAuthenticated,
    isPatient,
    isSecretary,
    isDermatologist,
    login,
    logout
  };
}