import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('ayuguard_token');
    const storedUser = localStorage.getItem('ayuguard_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ayuguard_token');
        localStorage.removeItem('ayuguard_user');
      }
    }
    setLoading(false);
  }, []);

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('ayuguard_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${baseUrl}${url}`, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
      // Token expired — auto logout
      logout();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return response.json();
  };

  const login = async (email, password) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('ayuguard_token', response.token);
    localStorage.setItem('ayuguard_user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const signup = async (userData) => {
    const response = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('ayuguard_token', response.token);
    localStorage.setItem('ayuguard_user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('ayuguard_token');
    localStorage.removeItem('ayuguard_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    localStorage.setItem('ayuguard_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, apiFetch, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
