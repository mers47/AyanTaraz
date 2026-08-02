import { User } from '@/types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Get the access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Set the access token in localStorage
 */
export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Remove the access token from localStorage
 */
export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Get the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Set the refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Remove the refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Get the current user from localStorage
 */
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set the current user in localStorage
 */
export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove the current user from localStorage
 */
export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuth = (): void => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};

/**
 * Check if the user is authenticated (has a valid access token)
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

/**
 * Initialize auth state from localStorage
 */
export const initAuth = (): { accessToken: string | null; user: User | null } => {
  return {
    accessToken: getAccessToken(),
    user: getUser(),
  };
};
