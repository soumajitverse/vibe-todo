import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { registerServerWakeUpCallback } from '../api/client';

const ServerHealthContext = createContext(null);

export const ServerHealthProvider = ({ children }) => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [justWokeUp, setJustWokeUp] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef(null);
  const isPollingRef = useRef(false);

  const getHealthUrl = () => {
    const base = import.meta.env.VITE_API_URL || 
      (import.meta.env.DEV ? '/api' : 'https://vibe-todo-7rhs.onrender.com/api');
    return `${base.replace(/\/+$/, '')}/health`;
  };

  const pingHealth = useCallback(async () => {
    try {
      const res = await axios.get(getHealthUrl(), { timeout: 8000 });
      if (res.status === 200 && res.data?.status === 'ok') {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    setIsWakingUp(true);
    setJustWokeUp(false);
    setAttempts(1);

    pollingRef.current = setInterval(async () => {
      setAttempts((prev) => prev + 1);

      const isHealthy = await pingHealth();
      if (isHealthy) {
        stopPolling();
        setIsWakingUp(false);
        setJustWokeUp(true);
        setTimeout(() => {
          setJustWokeUp(false);
        }, 3500);
      }
    }, 3000);
  }, [pingHealth, stopPolling]);

  useEffect(() => {
    // Register trigger from Axios error interceptor
    registerServerWakeUpCallback(() => {
      startPolling();
    });

    // Check once in background on initial page mount
    pingHealth().then((isHealthy) => {
      if (!isHealthy) {
        startPolling();
      }
    });

    return () => {
      stopPolling();
    };
  }, [startPolling, pingHealth, stopPolling]);

  return (
    <ServerHealthContext.Provider
      value={{
        isWakingUp,
        justWokeUp,
        attempts,
        startPolling,
      }}
    >
      {children}
    </ServerHealthContext.Provider>
  );
};

export const useServerHealth = () => {
  const context = useContext(ServerHealthContext);
  if (!context) {
    return { isWakingUp: false, justWokeUp: false, attempts: 0, startPolling: () => {} };
  }
  return context;
};
