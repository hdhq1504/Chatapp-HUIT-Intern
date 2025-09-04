export async function loginWithEmail({ email }) {
  await new Promise((res) => setTimeout(res, 300));
  const profile = {
    name: email.split('@')[0] || 'User',
    email,
    avatar: '',
  };
  const token = 'fake-token-front-only';
  return { token, profile };
}

export async function signupWithEmail({ username, email }) {
  await new Promise((res) => setTimeout(res, 300));
  const profile = {
    name: username || email.split('@')[0] || 'Guest',
    email,
    avatar: '',
  };
  const token = 'fake-token-front-only';
  return { token, profile };
}

export function saveAuthToLocal({ token, profile }) {
  try {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('profile_user', JSON.stringify(profile));
  } catch (err) {
    console.warn('saveAuthToLocal error', err);
  }
}

export function clearAuthFromLocal() {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('profile_user');
  } catch (err) {
    console.warn('clearAuthFromLocal error', err);
  }
}
