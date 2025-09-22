import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeSessionGetItem,
  safeSessionSetItem,
  safeSessionRemoveItem,
} from '../utils/storage/index';
import { api } from '../api/apiService';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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

  // Load user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        let parsedUser = safeSessionGetItem('authenticated_user', null);
        let authToken = safeSessionGetItem('auth_token', null);

        // Migrate legacy localStorage session if needed
        if (!parsedUser || !authToken) {
          const legacyUser = safeGetItem('authenticated_user', null);
          const legacyToken = safeGetItem('auth_token', null);
          const legacyRefreshToken = safeGetItem('refresh_token', null);

          if (legacyUser && legacyToken) {
            parsedUser = legacyUser;
            authToken = legacyToken;

            safeSessionSetItem('authenticated_user', legacyUser);
            safeSessionSetItem('auth_token', legacyToken);
            if (legacyRefreshToken) {
              safeSessionSetItem('refresh_token', legacyRefreshToken);
            }

            safeRemoveItem('authenticated_user');
            safeRemoveItem('auth_token');
            safeRemoveItem('refresh_token');
          }
        }

        if (parsedUser && authToken) {
          const normalizedUser = {
            id: parsedUser.id ?? null,
            name: parsedUser.name ?? parsedUser.fullName ?? '',
            email: parsedUser.email ?? parsedUser.username ?? '',
            phone: parsedUser.phone ?? '',
            avatar: parsedUser.avatar ?? null,
            roles: parsedUser.roles ?? [],
          };

          setUser(normalizedUser);
          safeSessionSetItem('authenticated_user', normalizedUser);
          safeSetItem('authenticated_user', normalizedUser);
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
                email: currentUser.data.email,
                phone: currentUser.data.phone || '',
                avatar: currentUser.data.avatar || null,
                roles: currentUser.data.roles || [],
              };
              setUser(updatedUser);
              safeSessionSetItem('authenticated_user', updatedUser);
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
          safeSessionRemoveItem('authenticated_user');
          safeSessionRemoveItem('auth_token');
          safeSessionRemoveItem('refresh_token');
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
            email: userResponse.data.email,
            phone: userResponse.data.phone || '',
            avatar: userResponse.data.avatar || null,
            roles: userResponse.data.roles || [],
          };

          // Save tokens and user data
          safeRemoveItem('authenticated_user');
          safeRemoveItem('auth_token');
          safeRemoveItem('refresh_token');
          safeSessionSetItem('authenticated_user', userData);
          safeSetItem('authenticated_user', userData);
          safeSessionSetItem('auth_token', accessToken);
          if (refreshToken) {
            safeSessionSetItem('refresh_token', refreshToken);
          }

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
      const { password, confirmPassword, fullName } = userData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const registerData = {
        name: fullName?.trim() || '',
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
        safeSessionRemoveItem('authenticated_user');
        safeSessionRemoveItem('auth_token');
        safeSessionRemoveItem('refresh_token');
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
        const serverUser = response.data;
        const updatedUser = {
          id: serverUser.id ?? user?.id ?? null,
          name: serverUser.name ?? updates?.name ?? user?.name ?? '',
          email: serverUser.email ?? updates?.email ?? user?.email ?? '',
          phone: serverUser.phone ?? updates?.phone ?? user?.phone ?? '',
          avatar: serverUser.avatar ?? updates?.avatar ?? user?.avatar ?? null,
          roles: serverUser.roles ?? user?.roles ?? [],
        };

        safeSessionSetItem('authenticated_user', updatedUser);
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
      const refreshTokenValue = safeSessionGetItem('refresh_token', null);
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await api.refreshToken();

      if (response.data && response.data.accessToken) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        safeSessionSetItem('auth_token', accessToken);
        if (newRefreshToken) {
          safeSessionSetItem('refresh_token', newRefreshToken);
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
