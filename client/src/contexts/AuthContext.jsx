/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeGetItem, safeSetItem, generateId, safeRemoveItem } from '../utils/storage/index';

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

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = () => {
      try {
        const parsedUser = safeGetItem('authenticated_user', null);
        const authToken = safeGetItem('auth_token', null);

        if (parsedUser && authToken) {
          setUser(parsedUser);
          setIsAuthenticated(true);
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

  // Simulate API login
  const login = async (credentials) => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication logic
      const { email, password } = credentials;

      // Simple validation (replace with real API call)
      if (email && password && password.length >= 6) {
        // Try to find existing user in localStorage (simulating database lookup)
        const existingUser = safeGetItem(`user_${email}`, null);

        if (existingUser) {
          const userData = existingUser;
          const authToken = btoa(`${email}:${password}:${Date.now()}`);

          // Store authenticated user
          safeSetItem('authenticated_user', userData);
          safeSetItem('auth_token', authToken);

          setUser(userData);
          setIsAuthenticated(true);

          return { success: true, user: userData };
        }
        throw new Error('User not found. Please sign up first.');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate API signup
  const signup = async (userData) => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const { username, email, password, confirmPassword } = userData;

      // Basic validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Check if user already exists (mock check)
      const existingUser = safeGetItem(`user_${email}`, null);
      if (existingUser) throw new Error('User already exists with this email');

      const newUserData = {
        id: generateId('user'),
        username,
        email,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        avatar: '',
        createdAt: new Date().toISOString(),
      };

      const authToken = btoa(`${email}:${password}:${Date.now()}`);

      // Store user data
      safeSetItem(`user_${email}`, newUserData);
      // Add to global users list so other accounts can find and add this user as contact
      try {
        const allUsers = safeGetItem('all_users', []);
        allUsers.push(newUserData);
        safeSetItem('all_users', allUsers);
      } catch (err) {
        console.warn('Failed to update all_users during signup', err);
      }
      safeSetItem('authenticated_user', newUserData);
      safeSetItem('auth_token', authToken);

      setUser(newUserData);
      setIsAuthenticated(true);

      return { success: true, user: newUserData };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      try {
        safeRemoveItem('authenticated_user');
        safeRemoveItem('auth_token');
      } catch (err) {
        console.warn('Error clearing local storage during logout', err);
      }

      // Reset state
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = (updates) => {
    try {
      const updatedUser = { ...user, ...updates };

      // Update local storage
      safeSetItem('authenticated_user', updatedUser);
      if (updatedUser.email) safeSetItem(`user_${updatedUser.email}`, updatedUser);

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
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
