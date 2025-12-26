'use client';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { AddressFormData } from '@/src/server/models/address.model';
import { INDIAN_STATES, EMPTY_ADDRESS } from '@/src/server/utils/constants';
import { validateAddress } from '@/src/server/services/address.service';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressFormData) => void;
  initialData?: AddressFormData;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_ADDRESS);
  const [isClosing, setIsClosing] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setFormData(initialData || EMPTY_ADDRESS);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (warning) setWarning('');
  };

  const handleSubmit = () => {
    const error = validateAddress(formData);
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
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ${
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
        <button onClick={handleClose} className="absolute -top-3 -right-3 cursor-pointer bg-white border p-2 z-50" type="button">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {initialData ? 'Edit Address' : 'Add Address'}
        </h2>

        <div className="space-y-4">
          <div className="flex gap-4">
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name *" className="w-1/2 px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name *" className="w-1/2 px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} placeholder="Street Address *" className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" />
            <p className="text-xs ml-4 text-gray-500 mt-1">E.g. 3 Stripes Street</p>
          </div>

          <div>
            <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" />
            <p className="text-xs ml-4 text-gray-500 mt-1">E.g. Company, Apartment, Building, etc.</p>
          </div>

          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City *" className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" />

          <div className="flex gap-4">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-1/2 px-4 text-sm py-2.5 h-10 border font-medium border-black focus:outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">State *</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode *" maxLength={6} className="w-1/2 px-4 py-2.5 border h-10 border-black focus:outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div>
            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Mobile Number *" maxLength={10} className="w-full px-4 py-2.5 border h-9 border-black focus:outline-none focus:ring-2 focus:ring-black" />
            <p className="text-xs ml-4 text-gray-500 mt-1 w-[250px]">We will only call you if there are questions regarding your order.</p>
          </div>

          {warning && <p className="text-red-600 text-sm">{warning}</p>}

          <button onClick={handleSubmit} className="bg-black cursor-pointer text-white py-3 px-4 w-[200px] font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 group">
            <span>Save</span>
            <Image src="/arrowIcon.svg" alt="arrow" width={20} height={20} className="group-hover:translate-x-1 transition-transform w-6 h-6" />
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

export default AddressModal;