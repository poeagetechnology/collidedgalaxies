'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGuestOrderAccess } from '@/src/hooks/useGuestOrderAccess';
import toast from 'react-hot-toast';

interface GuestAccessModalProps {
  onSuccess: (guestUID: string, guestName: string | null) => void;
  onSignUpClick: (phone: string) => void;
}

export default function GuestAccessModal({ onSuccess, onSignUpClick }: GuestAccessModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { findGuestByPhone, error } = useGuestOrderAccess();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits and common formatting characters
    const filtered = value.replace(/[^\d\s\-\+]/g, '');
    setPhoneNumber(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await findGuestByPhone(phoneNumber);

      if (result.guestUID) {
        // Save to localStorage for future visits
        localStorage.setItem('guestUID', result.guestUID);
        localStorage.setItem('guestPhoneNumber', phoneNumber.replace(/\D/g, ''));
        localStorage.setItem('lastGuestAccessTime', new Date().toISOString());

        toast.success(`Welcome back! Found your order(s)`, {
          style: { borderRadius: 0 },
        });

        onSuccess(result.guestUID, result.guestName);
      } else if (result.error) {
        toast.error(result.error, { style: { borderRadius: 0 } });
      }
    } catch (err) {
      toast.error('Error retrieving orders. Please try again.', {
        style: { borderRadius: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">View Your Orders</h2>
          <p className="text-gray-600 text-sm">
            Enter your phone number to access your order history
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your 10-digit phone number"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {phoneNumber.replace(/\D/g, '').length}/10 digits
            </p>
          </div>

          {error && (
            <motion.div
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading || phoneNumber.replace(/\D/g, '').length < 10}
            className="w-full bg-black text-white py-3 font-semibold rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'View My Orders'}
          </button>
        </motion.form>

        <motion.div
          className="border-t border-gray-200 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-sm text-gray-600 text-center mb-3">
            Don't have an account yet?
          </p>
          <button
            onClick={() => onSignUpClick(phoneNumber.replace(/\D/g, ''))}
            className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold py-2 transition-colors"
          >
            Create an Account
          </button>
        </motion.div>

        <motion.div
          className="mt-8 p-4 bg-gray-50 rounded border border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xs text-gray-600 text-center">
            <strong>Tip:</strong> Create an account to save your profile, addresses, and get faster checkout next time!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
