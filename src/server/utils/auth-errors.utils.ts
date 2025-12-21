export interface AuthError {
  code: string;
  message: string;
}

export const getAuthErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already in use. Please try logging in.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/operation-not-supported-in-this-environment': 'Google sign-in is not supported in this environment.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in.',
  };

  return errorMessages[code] || 'An error occurred. Please try again.';
};