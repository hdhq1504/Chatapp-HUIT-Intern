import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage/index';
import { api } from '../api/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = () => {
      try {
        const parsedUser = safeGetItem('authenticated_user', null);
        const authToken = safeGetItem('auth_token', null);

        if (parsedUser && authToken) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setToken(authToken);
          api.setToken(authToken);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        // best-effort cleanup
        try {
          safeRemoveItem('authenticated_user');
          safeRemoveItem('auth_token');
        } catch (err) {
          console.warn('Error cleaning up auth storage', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const { token: authToken, user: userData } = await api.login(credentials);
      safeSetItem('authenticated_user', userData);
      safeSetItem('auth_token', authToken);
      api.setToken(authToken);
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const { password, confirmPassword, ...rest } = userData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const { token: authToken, user: newUser } = await api.register({
        ...rest,
        password,
      });

      safeSetItem('authenticated_user', newUser);
      safeSetItem('auth_token', authToken);
      api.setToken(authToken);
      setUser(newUser);
      setToken(authToken);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      try {
        safeRemoveItem('authenticated_user');
        safeRemoveItem('auth_token');
      } catch (err) {
        console.warn('Error clearing local storage during logout', err);
      }
      api.setToken(null);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await api.updateProfile(updates);
      safeSetItem('authenticated_user', updatedUser);
      setUser(updatedUser);
      window.dispatchEvent(
        new CustomEvent('user-profile-updated', {
          detail: { user: updatedUser },
        }),
      );
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
