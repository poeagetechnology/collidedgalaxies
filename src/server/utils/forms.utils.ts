import type { AuthMode } from '../models/auth.model';

export const validateFormData = (
  mode: AuthMode,
  email: string,
  password: string,
  name?: string
): string | null => {
  if (!email) return 'Please enter your email address.';
  if (mode !== 'forgot-password' && !password) return 'Please enter your password.';
  if (mode === 'signup' && !name) return 'Please enter your full name.';
  return null;
};

export const getModalTitle = (mode: AuthMode): string => {
  if (mode === 'forgot-password') return 'Reset Password';
  return 'Welcome to COGA';
};

export const getSubmitButtonText = (mode: AuthMode): string => {
  if (mode === 'forgot-password') return 'Send Reset Link';
  if (mode === 'login') return 'Login';
  return 'Create Account';
};