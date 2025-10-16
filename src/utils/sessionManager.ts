import Cookies from 'js-cookie';

// Constants for session management
export const SESSION_COOKIE_NAME = 'restaurant_session_id';
export const SESSION_EXPIRY_HOURS = 12;

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Get the current session ID from cookies or create a new one
 */
export const getSessionId = (): string => {
  let sessionId = Cookies.get(SESSION_COOKIE_NAME);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    setSessionId(sessionId);
  }
  
  return sessionId;
};

/**
 * Store the session ID in cookies with expiration
 */
export const setSessionId = (sessionId: string): void => {
  Cookies.set(SESSION_COOKIE_NAME, sessionId, {
    expires: SESSION_EXPIRY_HOURS / 24, // Convert hours to days
    sameSite: 'strict',
    secure: import.meta.env.PROD // Only use secure in production
  });
};

/**
 * Clear the current session ID
 */
export const clearSessionId = (): void => {
  Cookies.remove(SESSION_COOKIE_NAME);
};

/**
 * Check if the session has expired
 * Note: Cookies automatically handle expiration, but we provide this
 * for consistency with the API
 */
export const isSessionExpired = (): boolean => {
  return !Cookies.get(SESSION_COOKIE_NAME);
};

/**
 * Check session and refresh if needed
 */
export const checkAndRefreshSession = (): string => {
  return getSessionId(); // This will create new if not exists or expired
};