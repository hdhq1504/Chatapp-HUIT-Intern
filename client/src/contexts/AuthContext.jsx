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
    const loadUser = async () => {
      try {
        const parsedUser = safeGetItem('authenticated_user', null);
        const authToken = safeGetItem('auth_token', null);

        if (parsedUser && authToken) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setToken(authToken);
          api.setToken(authToken);

          // Verify token is still valid by fetching current user
          try {
            const currentUser = await api.getCurrentUser();
            if (currentUser.data) {
              // Update user info in case it changed on server
              const updatedUser = {
                id: currentUser.data.id,
                name: currentUser.data.name,
                username: currentUser.data.email, // map email to username for compatibility
                email: currentUser.data.email,
                avatar: currentUser.data.avatar || null,
                roles: currentUser.data.roles || [],
              };
              setUser(updatedUser);
              safeSetItem('authenticated_user', updatedUser);
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            // Token is invalid, clear auth state
            await logout();
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        // best-effort cleanup
        try {
          safeRemoveItem('authenticated_user');
          safeRemoveItem('auth_token');
          safeRemoveItem('refresh_token');
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

      const response = await api.login(credentials);

      if (response.data && response.data.accessToken) {
        const { accessToken, refreshToken } = response.data;

        // Get user info
        api.setToken(accessToken);
        const userResponse = await api.getCurrentUser();

        if (userResponse.data) {
          const userData = {
            id: userResponse.data.id,
            name: userResponse.data.name,
            username: userResponse.data.email, // map email to username for compatibility
            email: userResponse.data.email,
            avatar: userResponse.data.avatar || null,
            roles: userResponse.data.roles || [],
          };

          // Save tokens and user data
          safeSetItem('authenticated_user', userData);
          safeSetItem('auth_token', accessToken);
          safeSetItem('refresh_token', refreshToken);

          setUser(userData);
          setToken(accessToken);
          setIsAuthenticated(true);

          return { success: true, user: userData };
        }
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const { password, confirmPassword, username, ...rest } = userData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const registerData = {
        name: username,
        phone: userData.phone,
        email: userData.email,
        password: password,
        roles: ['USER'],
      };

      console.log('Sending:', registerData);

      await api.register(registerData);

      // Auto login after registration
      const loginResult = await login({
        email: userData.email,
        password: password,
      });

      return loginResult.success
        ? { success: true, user: loginResult.user }
        : { success: false, error: 'Registration successful but login failed.' };
    } catch (error) {
      console.error('Signup error:', error);

      // Handle i18n error
      let errorMessage = 'Registration failed';
      if (error.message?.includes("code '1000'")) {
        errorMessage = 'Registration failed. Please check your input and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call backend logout endpoint
      try {
        await api.logout();
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with local cleanup even if API call fails
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always cleanup local state and storage
      try {
        safeRemoveItem('authenticated_user');
        safeRemoveItem('auth_token');
        safeRemoveItem('refresh_token');
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
      const response = await api.updateProfile(updates);

      if (response.data) {
        const updatedUser = {
          ...user,
          name: response.data.name || user.name,
          email: response.data.email || user.email,
          username: response.data.email || user.username,
          avatar: response.data.avatar || user.avatar,
        };

        safeSetItem('authenticated_user', updatedUser);
        setUser(updatedUser);

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent('user-profile-updated', {
            detail: { user: updatedUser },
          }),
        );

        return { success: true, user: updatedUser };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Profile update failed',
      };
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = safeGetItem('refresh_token', null);
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await api.refreshToken();

      if (response.data && response.data.accessToken) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        safeSetItem('auth_token', accessToken);
        if (newRefreshToken) {
          safeSetItem('refresh_token', newRefreshToken);
        }

        api.setToken(accessToken);
        setToken(accessToken);

        return { success: true, token: accessToken };
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }
  };

  // Auto refresh token when it's about to expire
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Check token expiration every 5 minutes
    const interval = setInterval(
      async () => {
        try {
          // Try to make an API call to check if token is still valid
          await api.getCurrentUser();
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            // Token expired, try to refresh
            const refreshResult = await refreshToken();
            if (!refreshResult.success) {
              console.log('Auto-logout due to token expiration');
            }
          }
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
