import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // On app load — check if token and user exist and are valid
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');

    if (token && saved) {
      try {
        // Check if token is expired (JWT)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp && payload.exp * 1000 < Date.now();

        if (isExpired) {
          // Token expired — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          setUser(JSON.parse(saved));
        }
      } catch (err) {
        // Token is not a valid JWT (e.g. during development)
        // Just restore the user from localStorage
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
      }
    }
    setAuthReady(true);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Don't render anything until auth state is determined
  if (!authReady) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};