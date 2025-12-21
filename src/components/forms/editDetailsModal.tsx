'use client';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface ProfileFormData {
  displayName: string;
  email: string;
  phoneNumber: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: ProfileFormData) => void;
  initialData: ProfileFormData;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [isClosing, setIsClosing] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setFormData(initialData);
      setWarning('');
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (warning) setWarning('');
  };

  const validateForm = (): string | null => {
    if (!formData.displayName.trim()) {
      return 'Name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      return 'Phone number must be 10 digits';
    }
    return null;
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      setWarning(error);
      return;
    }
    onSave(formData);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ${albertSans.className} ${
        isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/40 backdrop-blur-sm'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white shadow-2xl p-6 relative max-w-md w-full"
        style={{
          animation: isClosing
            ? 'modalZoomOut 0.3s ease-in forwards'
            : 'modalZoomIn 0.3s ease-out forwards'
        }}
      >
        <button 
          onClick={handleClose} 
          className="absolute -top-3 -right-3 cursor-pointer bg-white border p-2 z-50" 
          type="button"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Edit Profile Details
        </h2>

        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              name="displayName" 
              value={formData.displayName} 
              onChange={handleChange} 
              placeholder="Full Name *" 
              className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" 
            />
            <p className="text-xs ml-4 text-gray-500 mt-1">Your full name</p>
          </div>

          <div>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email *" 
              className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black"
              disabled
            />
            <p className="text-xs ml-4 text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              placeholder="Phone Number" 
              maxLength={10}
              className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" 
            />
            <p className="text-xs ml-4 text-gray-500 mt-1">10-digit mobile number (optional)</p>
          </div>

          {warning && <p className="text-red-600 text-sm">{warning}</p>}

          <button 
            onClick={handleSubmit} 
            className="bg-black cursor-pointer text-white py-3 px-4 w-[200px] font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 group"
          >
            <span>Save Changes</span>
            <Image 
              src="/arrowIcon.svg" 
              alt="arrow" 
              width={20} 
              height={20} 
              className="group-hover:translate-x-1 transition-transform w-6 h-6" 
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalZoomIn {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalZoomOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.7) translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default EditProfileModal;