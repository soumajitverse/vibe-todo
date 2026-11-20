import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('vibe_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vibe_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('vibe_token');
      if (storedToken) {
        try {
          const data = await authApi.getMe();
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('vibe_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth cache.');
          localStorage.removeItem('vibe_token');
          localStorage.removeItem('vibe_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('vibe_token', data.token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
    return data;
  };

  const signup = async (email, password) => {
    const data = await authApi.signup(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('vibe_token', data.token);
    localStorage.setItem('vibe_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vibe_token');
    localStorage.removeItem('vibe_user');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
