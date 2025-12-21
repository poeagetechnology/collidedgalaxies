import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { auth } from '@/src/context/authProvider';
import { saveUserToFirestore } from './firestore.service';
import { getAuthErrorMessage, AuthError } from '@/src/server/utils/auth-errors.utils';
import { isMobileDevice, setGoogleSignInPending } from '@/src/server/utils/device.utils';

export const signUpWithEmail = async (
  email: string,
  password: string,
  name?: string
): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(userCredential.user, name);
    return userCredential.user;
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful for:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const signInWithGoogleProvider = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      display: 'popup'
    });

    const isMobile = isMobileDevice();

    try {
      console.log('Attempting Google sign-in with popup...');
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        console.log('Popup sign-in successful');
        await saveUserToFirestore(result.user);
        return result.user;
      }
    } catch (popupError: any) {
      console.warn('Popup error:', popupError.code);
      
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        isMobile
      ) {
        console.log('Falling back to redirect flow...');
        setGoogleSignInPending(true);
        await signInWithRedirect(auth, provider);
        return null;
      }
      
      throw popupError;
    }
    
    return null;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const handleGoogleRedirectResult = async (): Promise<User | null> => {
  try {
    console.log('Checking for redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result?.user) {
      console.log('Redirect successful - user:', result.user.email);
      await saveUserToFirestore(result.user);
      setGoogleSignInPending(false);
      return result.user;
    }
    
    console.log('No redirect result found');
    return null;
  } catch (error: any) {
    console.error('Redirect result error:', error);
    setGoogleSignInPending(false);
    return null;
  }
};

export const sendPasswordResetLink = async (email: string): Promise<void> => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: false,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const verifyPasswordResetCode = async (code: string): Promise<string> => {
  try {
    const { verifyPasswordResetCode: fbVerifyPasswordResetCode } = await import('firebase/auth');
    const email = await fbVerifyPasswordResetCode(auth, code);
    return email;
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const confirmPasswordReset = async (code: string, newPassword: string): Promise<void> => {
  try {
    const { confirmPasswordReset: fbConfirmPasswordReset } = await import('firebase/auth');
    await fbConfirmPasswordReset(auth, code, newPassword);
    console.log('Password reset successfully');
  } catch (error: any) {
    console.error('Confirm password reset error:', error);
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};