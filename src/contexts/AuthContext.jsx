import React, { createContext, useContext, useState, useEffect } from 'react';

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
        const storedUser = localStorage.getItem('authenticated_user');
        const authToken = localStorage.getItem('auth_token');

        if (storedUser && authToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('authenticated_user');
        localStorage.removeItem('auth_token');
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
        const existingUser = localStorage.getItem(`user_${email}`);

        if (existingUser) {
          // User exists, use their stored information
          const userData = JSON.parse(existingUser);
          const authToken = btoa(`${email}:${password}:${Date.now()}`);

          // Store authenticated user
          localStorage.setItem('authenticated_user', JSON.stringify(userData));
          localStorage.setItem('auth_token', authToken);

          setUser(userData);
          setIsAuthenticated(true);

          return { success: true, user: userData };
        } else {
          // User doesn't exist, return error
          throw new Error('User not found. Please sign up first.');
        }
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
      const existingUser = localStorage.getItem(`user_${email}`);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const newUserData = {
        id: Date.now(),
        username: username,
        email: email,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        avatar: '',
        createdAt: new Date().toISOString(),
      };

      const authToken = btoa(`${email}:${password}:${Date.now()}`);

      // Store user data
      localStorage.setItem(`user_${email}`, JSON.stringify(newUserData));
      localStorage.setItem('authenticated_user', JSON.stringify(newUserData));
      localStorage.setItem('auth_token', authToken);

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
      localStorage.removeItem('authenticated_user');
      localStorage.removeItem('auth_token');

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

      // Update localStorage
      localStorage.setItem('authenticated_user', JSON.stringify(updatedUser));

      // Update state
      if (updatedUser.email) {
        localStorage.setItem(`user_${updatedUser.email}`, JSON.stringify(updatedUser));
      }

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
