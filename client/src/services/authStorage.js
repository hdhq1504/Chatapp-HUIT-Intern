import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storageUtils';

const AUTH_TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'profile_user';

export function saveAuth({ token, profile }) {
    safeSetItem(AUTH_TOKEN_KEY, token);
    safeSetItem(PROFILE_KEY, profile);
}

export function clearAuth() {
    try {
    // remove via safe helper
    safeRemoveItem(AUTH_TOKEN_KEY);
    safeRemoveItem(PROFILE_KEY);
        return true;
    } catch (err) {
        console.warn('clearAuth error', err);
        return false;
    }
}

export function getAuth() {
    const token = safeGetItem(AUTH_TOKEN_KEY, null);
    const profile = safeGetItem(PROFILE_KEY, null);
    return { token, profile };
}

export function getToken() {
    return safeGetItem(AUTH_TOKEN_KEY, null);
}

export function getProfile() {
    return safeGetItem(PROFILE_KEY, null);
}
