import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  api,
  setupApiInterceptors,
  handleApiResponse,
  handleApiError,
} from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('auth_token') || null,
  );

  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem('refresh_token') || null,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setupApiInterceptors(
      () => token,
      () => {
        logout();
      },
      async () => {
        if (refreshToken) {
          const response = await api.refreshToken();
          const tokens = handleApiResponse(response);
          setToken(tokens.token);
          setRefreshToken(tokens.refreshToken);
          saveTokensToStorage(tokens.token, tokens.refreshToken);
          return tokens;
        }
        throw new Error('No refresh token available');
      },
    );
  }, [token, refreshToken]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          setLoading(true);
          const response = await api.getCurrentUser();
          const userData = handleApiResponse(response);
          setUser(userData);
          saveUserToStorage(userData);
        } catch (error) {
          console.error('Auto-login failed:', error);
          clearAuthFromStorage();
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [token, user]);

  const saveAuthToStorage = (user, token, refreshToken) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.warn('Error saving auth to storage:', error);
    }
  };

  const saveUserToStorage = (user) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.warn('Error saving user to storage:', error);
    }
  };

  const saveTokensToStorage = (token, refreshToken) => {
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.warn('Error saving tokens to storage:', error);
    }
  };

  const clearAuthFromStorage = () => {
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.warn('Error clearing auth from storage:', error);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.login(credentials);
      const authData = handleApiResponse(response);

      const {
        user: userData,
        token: authToken,
        refreshToken: authRefreshToken,
      } = authData;

      setUser(userData);
      setToken(authToken);
      setRefreshToken(authRefreshToken);

      saveAuthToStorage(userData, authToken, authRefreshToken);

      navigate('/');
    } catch (error) {
      const errorData = handleApiError(error);
      setError(errorData.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.register(userData);
      const authData = handleApiResponse(response);

      const {
        user: newUser,
        token: authToken,
        refreshToken: authRefreshToken,
      } = authData;

      setUser(newUser);
      setToken(authToken);
      setRefreshToken(authRefreshToken);

      saveAuthToStorage(newUser, authToken, authRefreshToken);

      navigate('/');
    } catch (error) {
      const errorData = handleApiError(error);
      setError(errorData.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      if (token) {
        await api.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      clearAuthFromStorage();
      setLoading(false);
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.updateProfile(profileData);
      const updatedUser = handleApiResponse(response);

      setUser(updatedUser);
      saveUserToStorage(updatedUser);

      return updatedUser;
    } catch (error) {
      const errorData = handleApiError(error);
      setError(errorData.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
