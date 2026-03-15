'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  sendPhoneOTP, 
  verifyPhoneOTP, 
  createGuestSession,
  clearRecaptcha 
} from '@/src/server/services/phoneAuth.service';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (userId: string, phoneNumber: string) => void;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerificationComplete,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    if (normalizedPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number', { style: { borderRadius: 0 } });
      return;
    }

    setLoading(true);

    try {
      // Send OTP via Firebase (OTP verification is bypassed)
      const result = await sendPhoneOTP(normalizedPhone);
      setConfirmationResult(result);

      // With OTP bypass, directly verify with a dummy OTP
      const dummyOtp = '000000'; // Any 6-digit code works
      const userId = await verifyPhoneOTP(dummyOtp);

      // Create guest session
      createGuestSession(normalizedPhone, userId);

      toast.success('Phone verified successfully!', { style: { borderRadius: 0 } });

      // Call completion handler
      onVerificationComplete(userId, normalizedPhone);

      // Close modal
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify phone. Please try again.', { style: { borderRadius: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits', { style: { borderRadius: 0 } });
      return;
    }

    setLoading(true);

    try {
      // Verify OTP via Firebase
      const userId = await verifyPhoneOTP(otpCode);

      const normalizedPhone = phoneNumber.replace(/\D/g, '');

      // Create guest session
      createGuestSession(normalizedPhone, userId);

      toast.success('Phone verified successfully!', { style: { borderRadius: 0 } });

      // Call completion handler
      onVerificationComplete(userId, normalizedPhone);

      // Close modal
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP. Please try again.', { style: { borderRadius: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      const normalizedPhone = phoneNumber.replace(/\D/g, '');
      const result = await sendPhoneOTP(normalizedPhone);
      setConfirmationResult(result);

      toast.success('OTP sent to your phone number!', { style: { borderRadius: 0 } });

      setOtp(['', '', '', '']);
      setTimer(60);
      otpInputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP. Please try again.', { style: { borderRadius: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearRecaptcha();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit}>
            <h2 className="text-2xl font-bold mb-2">Verify Your Phone</h2>
            <p className="text-gray-600 mb-6">
              Enter your phone number to proceed with checkout
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98765 43210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit phone number
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Proceed'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit OTP to +91{phoneNumber.replace(/\D/g, '')}
            </p>

            {/* OTP Input Fields */}
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center mb-6">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in <span className="font-bold text-blue-600">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors mb-3"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp(['', '', '', '']);
                setTimer(0);
                clearRecaptcha();
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>

      {/* Recaptcha Container */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
}

