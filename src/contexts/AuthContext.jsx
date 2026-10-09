import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'apps_admin_token';

const AuthContext = createContext(null);

export function AuthProvider({ children, onRequireLogin }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pendingCallbackRef = useRef(null);

  // Verify existing token on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem(SESSION_KEY);
    if (!storedToken) {
      setIsChecking(false);
      return;
    }
    fetch('/api/auth/status', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
      })
      .finally(() => setIsChecking(false));
  }, []);

  const getToken = () => sessionStorage.getItem(SESSION_KEY) || '';

  const login = useCallback(async (password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    sessionStorage.setItem(SESSION_KEY, data.token);
    setIsAuthenticated(true);
    return data.token;
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  // Call this before any write operation.
  // If authenticated → runs callback immediately.
  // If not → opens login modal, then runs callback after successful login.
  const requireAuth = useCallback((callback) => {
    if (isAuthenticated) {
      callback();
    } else {
      pendingCallbackRef.current = callback;
      if (onRequireLogin) onRequireLogin();
    }
  }, [isAuthenticated, onRequireLogin]);

  // Called by LoginModal after successful login
  const onLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    if (pendingCallbackRef.current) {
      const cb = pendingCallbackRef.current;
      pendingCallbackRef.current = null;
      // Small timeout to let modal close first
      setTimeout(() => cb(), 100);
    }
  }, []);

  // Auth-aware fetch headers
  const authHeaders = useCallback(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isChecking,
      login,
      logout,
      requireAuth,
      onLoginSuccess,
      authHeaders,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
