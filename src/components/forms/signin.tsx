'use client';
import React from 'react';
import { X, Loader, Check, X as XIcon } from 'lucide-react';
import { Albert_Sans } from 'next/font/google';
import { useAuthForm } from '@/src/hooks/useAuthForm';
import { useGoogleAuth } from '@/src/hooks/useGoogleAuth';
import { handleAuthSubmit, handleGoogleAuth } from '@/src/server/services/auth.service';
import { getModalTitle, getSubmitButtonText } from '@/src/server/utils/forms.utils';
import { isPasswordValid } from '@/src/server/utils/password.utils';
import { PASSWORD_REQUIREMENT_LABELS } from '@/src/server/utils/constants';
import type { SignInProps } from '@/src/server/models/auth.model';

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <XIcon className="w-4 h-4 text-red-600" />
    )}
    <span className={`text-xs ${met ? 'text-green-600' : 'text-red-600'}`}>
      {label}
    </span>
  </div>
);

const SignIn: React.FC<SignInProps> = ({ isOpen, onClose }) => {
  const {
    mode,
    setMode,
    isClosing,
    isLoading,
    setIsLoading,
    isRedirecting,
    setIsRedirecting,
    error,
    setError,
    success,
    setSuccess,
    formData,
    setFormData,
    passwordRequirements,
    handleInputChange,
    handleClose,
    handleBackdropClick,
    authLoading,
  } = useAuthForm(isOpen, onClose);

  useGoogleAuth(authLoading, setIsRedirecting, setSuccess);

  if (!isOpen && !isClosing) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleAuthSubmit({
      mode,
      formData,
      passwordRequirements,
      setError,
      setSuccess,
      setIsLoading,
      setFormData,
      setMode,
      handleClose,
    });
  };

  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await handleGoogleAuth({
      setError,
      setSuccess,
      setIsLoading,
      setIsRedirecting,
      handleClose,
    });
  };

  const toggleMode = (): void => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', name: '' });
    setError(null);
    setSuccess(null);
  };

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-350 ease-out ${
        isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/40 backdrop-blur-sm'
      } ${albertSans.className}`}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-md relative transition-all duration-350 ease-in-out"
        style={{
          animation: isClosing
            ? 'modalZoomOut 0.3s ease-in forwards'
            : 'modalZoomIn 0.3s ease-out forwards',
        }}
      >
        {/* Close Button */}
        {!isRedirecting && (
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 cursor-pointer bg-white border p-2 z-10 hover:bg-gray-100 transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="px-10 py-14 max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getModalTitle(mode)}
            </h2>
            {mode === 'forgot-password' && (
              <p className="text-sm text-gray-600">
                Enter your email to receive a password reset link
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Redirecting State */}
          {isRedirecting && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-center">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-700">Completing Google sign-in...</p>
              <p className="text-xs text-blue-600 mt-1">Please wait...</p>
            </div>
          )}

          {/* Form */}
          {!isRedirecting && (
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div className={mode === 'forgot-password' || mode === 'login' ? '' : 'mb-4'}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              {mode !== 'forgot-password' && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm mt-4 font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      mode === 'login' ? 'Enter your password' : 'Create a password'
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />

                  {/* Password Requirements (Sign Up only) */}
                  {mode === 'signup' && formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 space-y-2">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Password Requirements:
                      </p>
                      {PASSWORD_REQUIREMENT_LABELS.map(({ key, label }) => (
                        <RequirementItem
                          key={key}
                          met={passwordRequirements[key]}
                          label={label}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm text-black cursor-pointer hover:opacity-70 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {mode === 'forgot-password' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm cursor-pointer text-black hover:opacity-70 transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  (mode === 'signup' && !isPasswordValid(passwordRequirements))
                }
                className="w-full mt-6 bg-black cursor-pointer text-white py-3 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {getSubmitButtonText(mode)}
              </button>

              {mode !== 'forgot-password' && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full border cursor-pointer border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>

                  {/* Mode Toggle */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                      {mode === 'login'
                        ? "Don't have an account? "
                        : 'Already have an account? '}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-black cursor-pointer hover:opacity-70 font-medium transition-colors"
                      >
                        {mode === 'login' ? 'Sign Up' : 'Log In'}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes modalZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes modalZoomOut {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.7) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default SignIn;