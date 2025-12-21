import { signUp, login, resetPassword, signInWithGoogle } from '@/src/context/authProvider';
import { validateFormData } from '@/src/server/utils/forms.utils';
import { isPasswordValid } from '@/src/server/utils/password.utils';
import { AUTH_REDIRECT_DELAY, AUTH_SUCCESS_DELAY } from '../utils/constants';
import type { AuthMode, FormData, PasswordRequirements } from '../models/auth.model';

interface AuthHandlerParams {
  mode: AuthMode;
  formData: FormData;
  passwordRequirements: PasswordRequirements;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setFormData: (data: FormData) => void;
  setMode: (mode: AuthMode) => void;
  handleClose: () => void;
}

export const handleAuthSubmit = async ({
  mode,
  formData,
  passwordRequirements,
  setError,
  setSuccess,
  setIsLoading,
  setFormData,
  setMode,
  handleClose,
}: AuthHandlerParams): Promise<void> => {
  setError(null);
  setSuccess(null);
  setIsLoading(true);

  try {
    // Validate form data
    const validationError = validateFormData(
      mode,
      formData.email,
      formData.password,
      formData.name
    );

    if (validationError) {
      throw { message: validationError };
    }

    // Handle different auth modes
    if (mode === 'forgot-password') {
      await resetPassword(formData.email);
      setSuccess('Password reset link sent to your email!');
      setFormData({ email: '', password: '', name: '' });
      setTimeout(() => {
        setMode('login');
        setIsLoading(false);
      }, AUTH_SUCCESS_DELAY);
    } else if (mode === 'login') {
      await login(formData.email, formData.password);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justLoggedIn', 'true');
      }
      setSuccess('Login successful!');
      setFormData({ email: '', password: '', name: '' });
      setTimeout(handleClose, AUTH_REDIRECT_DELAY);
    } else {
      // Sign up
      if (!isPasswordValid(passwordRequirements)) {
        throw { message: 'Password does not meet all requirements.' };
      }
      await signUp(formData.email, formData.password, formData.name!);
      setSuccess('Account created successfully!');
      setFormData({ email: '', password: '', name: '' });
      setTimeout(handleClose, AUTH_REDIRECT_DELAY);
    }
  } catch (err: any) {
    setError(err.message || 'An unexpected error occurred.');
    setIsLoading(false);
  }
};

interface GoogleAuthParams {
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsRedirecting: (redirecting: boolean) => void;
  handleClose: () => void;
}

export const handleGoogleAuth = async ({
  setError,
  setSuccess,
  setIsLoading,
  setIsRedirecting,
  handleClose,
}: GoogleAuthParams): Promise<void> => {
  setError(null);
  setSuccess(null);
  setIsLoading(true);

  try {
    const result = await signInWithGoogle();

    if (result) {
      // Desktop popup flow completed successfully
      setSuccess('Google Sign-In successful!');
      setTimeout(handleClose, AUTH_REDIRECT_DELAY);
    } else {
      // Redirect flow initiated
      setIsRedirecting(true);
      setSuccess('Redirecting to Google...');
    }
  } catch (err: any) {
    console.error('Google sign-in error:', err);
    setIsLoading(false);
    setIsRedirecting(false);
    setError(err.message || 'Google Sign-In failed. Please try again.');
  }
};