import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/authProvider';
import { validatePassword } from '@/src/server/utils/password.utils';
import { AUTH_ANIMATION_DURATION } from '@/src/server/utils/constants';
import type { FormData, PasswordRequirements, AuthMode } from '@/src/server/models/auth.model';

export const useAuthForm = (isOpen: boolean, onClose: () => void) => {
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const resetForm = () => {
    setMode('login');
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    setFormData({ email: '', password: '', name: '' });
    setPasswordRequirements({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    });
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !isRedirecting) {
      resetForm();
    }
  }, [isOpen, isRedirecting]);

  // Handle successful authentication
  useEffect(() => {
    if (isOpen && user && !authLoading && !isRedirecting) {
      handleClose();
    }
  }, [isOpen, user, authLoading, isRedirecting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);

    if (name === 'password' && mode === 'signup') {
      setPasswordRequirements(validatePassword(value));
    }
  };

  const handleClose = () => {
    if (isRedirecting) return;

    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsRedirecting(false);
      resetForm();
      onClose();
    }, AUTH_ANIMATION_DURATION);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isRedirecting) {
      handleClose();
    }
  };

  return {
    // Auth state
    user,
    authLoading,
    // UI state
    mode,
    setMode,
    isClosing,
    isLoading,
    setIsLoading,
    isRedirecting,
    setIsRedirecting,
    // Form state
    error,
    setError,
    success,
    setSuccess,
    formData,
    setFormData,
    passwordRequirements,
    // Handlers
    handleInputChange,
    handleClose,
    handleBackdropClick,
    resetForm,
  };
};