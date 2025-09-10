import { saveAuth, clearAuth, getProfile, getToken } from './authStorage';
import apiService from '../api/apiService';

export async function loginWithEmail({ email, password }) {
  try {
    const response = await apiService.login({ email, password });
    const { token, user: profile } = response;
    saveAuth({ token, profile });
    apiService.setToken(token);
    return { token, profile };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

export async function signupWithEmail({ username, email, password }) {
  try {
    const response = await apiService.register({ username, email, password });
    const { token, user: profile } = response;
    saveAuth({ token, profile });
    apiService.setToken(token);
    return { token, profile };
  } catch (error) {
    throw new Error(error.message || 'Signup failed');
  }
}

export function saveAuthToLocal({ token, profile }) {
  saveAuth({ token, profile });
}

export function clearAuthFromLocal() {
  return clearAuth();
}

export function getStoredProfile() {
  return getProfile();
}

export function getStoredToken() {
  return getToken();
}
