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
      
      // Try to link phone account if user has one
      try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // Check if there's a guest phone number to link
          const guestPhoneNumber = sessionStorage.getItem('guestPhoneNumber');
          if (guestPhoneNumber && user.uid) {
            console.log('🔗 Attempting to link phone account...');
            await fetch('/api/link-phone-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.uid,
                phoneNumber: guestPhoneNumber,
                userName: user.displayName,
                userEmail: user.email,
              }),
            });
            sessionStorage.removeItem('guestPhoneNumber');
          }
        }
      } catch (linkError) {
        console.warn('⚠️ Could not link phone account:', linkError);
        // Don't fail login if phone linking fails
      }
      
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

      // Try to link guest account if user has one
      try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          // Check if there's a guest phone number to link (from guest checkout)
          const guestPhoneNumber = sessionStorage.getItem('guestPhoneNumber') || localStorage.getItem('guestPhoneNumber');
          if (guestPhoneNumber && user.uid) {
            console.log('🔗 Attempting to link guest account during signup...');
            const linkResponse = await fetch('/api/link-phone-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.uid,
                phoneNumber: guestPhoneNumber,
                userName: user.displayName || formData.name,
                userEmail: user.email,
              }),
            });

            const linkResult = await linkResponse.json();
            if (linkResult.success && linkResult.linked) {
              console.log('✅ Guest account linked successfully during signup');
              // Clear guest session data
              sessionStorage.removeItem('guestPhoneNumber');
              sessionStorage.removeItem('guestPhone');
              localStorage.removeItem('guestUID');
              localStorage.removeItem('guestName');
              localStorage.removeItem('guestPhoneNumber');
              localStorage.removeItem('guestSessionData');
            }
          }
        }
      } catch (linkError) {
        console.warn('⚠️ Could not link guest account:', linkError);
        // Don't fail signup if guest linking fails
      }

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
    setIsLoading(false);
    setIsRedirecting(false);
    setError(err.message || 'Google Sign-In failed. Please try again.');
  }
};