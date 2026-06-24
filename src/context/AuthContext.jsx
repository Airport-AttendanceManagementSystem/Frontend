import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ams_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password });
    const userData = res.data.user;
    setUser(userData);
    localStorage.setItem('ams_user', JSON.stringify(userData));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ams_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, apiUrl: API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
