'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, Loader, Check, X as XIcon } from 'lucide-react';
import { Albert_Sans } from 'next/font/google';
import { confirmPasswordReset, verifyPasswordResetCode } from '@/src/server/services/firebaseAuth.service';

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

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

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Validate the reset code on mount
  useEffect(() => {
    const validateCode = async () => {
      if (!oobCode) {
        setError('Invalid or missing reset link');
        setIsValidating(false);
        return;
      }

      try {
        await verifyPasswordResetCode(oobCode);
        setIsCodeValid(true);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Invalid or expired reset link');
        setIsCodeValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateCode();
  }, [oobCode]);

  const validatePassword = (password: string): PasswordRequirements => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const isPasswordValid = (requirements: PasswordRequirements): boolean => {
    return Object.values(requirements).every((req) => req === true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordRequirements(validatePassword(value));
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!newPassword) {
      setError('Please enter a new password');
      setLoading(false);
      return;
    }

    if (!isPasswordValid(passwordRequirements)) {
      setError('Password does not meet all requirements');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!oobCode) {
      setError('Invalid reset link');
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(oobCode, newPassword);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${albertSans.className}`}
      >
        <div className="bg-white shadow-2xl w-full max-w-md p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-4" />
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid code state
  if (!isCodeValid || !oobCode) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${albertSans.className}`}
      >
        <div className="bg-white shadow-2xl w-full max-w-md relative">

          <div className="px-10 py-14 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-sm text-gray-600 mb-10">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <a
              href="/"
              className="inline-block bg-orange-500 text-white px-6 py-2 font-medium hover:bg-orange-600 transition-colors"
            > Go back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${albertSans.className}`}
      >
        <div className="bg-white shadow-2xl w-full max-w-md">
          <div className="px-10 py-14 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successfully!</h1>
            <p className="text-sm text-gray-600 mb-6">Your password has been updated. Redirecting to home...</p>
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin text-orange-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form state
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${albertSans.className}`}
    >
      <div className="bg-white shadow-2xl w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute -top-3 -right-3 cursor-pointer bg-white border p-2 z-10 hover:bg-gray-100 transition-colors"
          type="button"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Modal Content */}
        <div className="px-10 py-14 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-sm text-gray-600">Enter a new password that meets all requirements</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword}>
            {/* New Password Field */}
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="Create a password"
                required
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <RequirementItem met={passwordRequirements.length} label="At least 8 characters" />
                  <RequirementItem met={passwordRequirements.uppercase} label="At least 1 uppercase letter (A-Z)" />
                  <RequirementItem met={passwordRequirements.lowercase} label="At least 1 lowercase letter (a-z)" />
                  <RequirementItem met={passwordRequirements.number} label="At least 1 number (0-9)" />
                  <RequirementItem met={passwordRequirements.special} label="At least 1 special character (!@#$%^&*)" />
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid(passwordRequirements)}
              className="w-full mt-6 cursor-pointer bg-orange-500 text-white py-3 font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <a href="/" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
              Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}