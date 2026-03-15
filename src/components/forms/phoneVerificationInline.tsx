'use client';

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  sendPhoneOTP, 
  verifyPhoneOTP, 
  createGuestSession,
  clearRecaptcha 
} from '@/src/server/services/phoneAuth.service';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneVerificationInlineProps {
  onVerificationComplete: (userId: string, phoneNumber: string) => void;
  phoneNumber?: string;
}

export default function PhoneVerificationInline({
  onVerificationComplete,
  phoneNumber: initialPhone = '',
}: PhoneVerificationInlineProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
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

      // Clear reCAPTCHA
      clearRecaptcha();

      // Call callback
      onVerificationComplete(userId, normalizedPhone);

      // Reset form
      setOtp(['', '', '', '', '', '']);
      setStep('phone');
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
      const userId = await verifyPhoneOTP(otpCode);

      // Create guest session
      createGuestSession(phoneNumber.replace(/\D/g, ''), userId);

      toast.success('Phone verified successfully!', { style: { borderRadius: 0 } });

      // Clear reCAPTCHA
      clearRecaptcha();

      // Call callback
      onVerificationComplete(userId, phoneNumber.replace(/\D/g, ''));

      // Reset form
      setOtp(['', '', '', '', '', '']);
      setStep('phone');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP. Please try again.', { style: { borderRadius: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;

    setLoading(true);

    try {
      const normalizedPhone = phoneNumber.replace(/\D/g, '');
      const result = await sendPhoneOTP(normalizedPhone);
      setConfirmationResult(result);

      toast.success('OTP resent to your phone!', { style: { borderRadius: 0 } });
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP', { style: { borderRadius: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setTimer(0);
  };

  if (step === 'phone') {
    return (
      <div className="mb-8">
        <h3 className="block text-sm font-bold mb-4">PHONE VERIFICATION</h3>
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="98765 43210"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter 10-digit phone number
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-sm"
          >
            {loading ? 'Verifying...' : 'Verify & Proceed'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="block text-sm font-bold mb-4">ENTER OTP</h3>
      <p className="text-sm text-gray-600 mb-4">
        We've sent a 6-digit OTP to <span className="font-bold">+91{phoneNumber.replace(/\D/g, '')}</span>
      </p>

      <form onSubmit={handleOtpSubmit} className="space-y-4">
        {/* OTP Input Fields */}
        <div className="flex gap-3 justify-center mb-4">
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
              className="w-10 h-10 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black outline-none"
            />
          ))}
        </div>

        {/* Resend OTP */}
        <div className="text-center mb-4">
          {timer > 0 ? (
            <p className="text-sm text-gray-600">
              Resend OTP in <span className="font-bold">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-sm text-black hover:text-gray-700 font-medium disabled:text-gray-400"
            >
              Resend OTP
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-sm"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={handleChangePhone}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 transition-colors text-sm"
          >
            Change Phone
          </button>
        </div>
      </form>
    </div>
  );
}
