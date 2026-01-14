'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
import Image from "next/image";
import { useAuth, db } from "../../../src/context/authProvider";
import { useCart } from "@/src/context/CartContext";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Check } from "lucide-react";
import AddressModal from "@/src/components/forms/addressModal";
import { AddressFormData } from "@/src/server/models/address.model";
import { collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";


declare global {
  interface Window {
    Razorpay: any;
  }
}


export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user, loading } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [currentTab, setCurrentTab] = useState<'information' | 'shipping' | 'payment'>('information');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [directBuyData, setDirectBuyData] = useState<any>(null);
  
  // Form state for information tab
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    state: '',
    address: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);
    // Load direct buy data from sessionStorage if available
    const savedDirectBuyData = sessionStorage.getItem('directBuyData');
    if (savedDirectBuyData) {
      try {
        const data = JSON.parse(savedDirectBuyData);
        setDirectBuyData(data);
        console.log('[Checkout] Loaded directBuyData:', data);
      } catch (e) {
        console.error('Failed to parse directBuyData:', e);
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("appliedCoupon");
    if (saved) setAppliedCoupon(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [appliedCoupon]);

  const cartCount = cartItems.length;

  useEffect(() => {
    const loadCoupons = async () => {
      const couponsRef = collection(db, "media", "couponData", "coupons");
      const snap = await getDocs(couponsRef);

      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setAllCoupons(list);
    };

    loadCoupons();
  }, []);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      toast.error("Enter a coupon code", { style: { borderRadius: 0 } });
      return;
    }

    const match = allCoupons.find(
      (c) => c.code === couponInput.trim()
    );

    if (!match) {
      toast.error("Invalid coupon code", { style: { borderRadius: 0 } });
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(match);
    toast.success(`Coupon applied: ${match.discount}% OFF`, { style: { borderRadius: 0 } });
  };

  // Calculate subtotal from both cart items and direct buy data
  let subtotal = 0;
  let displayItems = cartItems;
  
  // If direct buy data exists and cart is empty, use direct buy data
  if (directBuyData && cartItems.length === 0) {
    const directBuyPrice = Number(directBuyData.price) || 0;
    const directBuyQuantity = directBuyData.quantity || 1;
    subtotal = directBuyPrice * directBuyQuantity;
  } else {
    // Use cart items
    cartItems.forEach(it => {
      subtotal += (it.price ?? 0) * it.quantity;
    });
  }
  
  const shipping = shippingMethod === 'express' ? 200 : 0;
  // const tax = subtotal > 0 ? Math.round(subtotal * 0.02) : 0;
  const tax = 0;
  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discount) / 100)
    : 0;

  const total = subtotal - discountAmount + shipping + tax;

  // Fetch user name from Firestore
  useEffect(() => {
    if (user) {
      const fetchUserName = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || user.email);
          } else {
            setUserName(user.email);
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          setUserName(user.email);
        }
      };
      fetchUserName();
    } else {
      setUserName(null);
    }
  }, [user]);

  // Load addresses from Firebase (initial load only)
  useEffect(() => {
    if (user && isInitialLoad) {
      const fetchAddresses = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.addresses && Array.isArray(userData.addresses) && userData.addresses.length > 0) {
              setAddresses(userData.addresses);
              setSelectedAddressIndex(0);
              
              // Populate form with first address
              const firstAddress = userData.addresses[0];
              setFormData({
                firstName: firstAddress.firstName || '',
                lastName: firstAddress.lastName || '',
                country: firstAddress.country || '',
                state: firstAddress.state || '',
                address: firstAddress.address || '',
                city: firstAddress.city || '',
                postalCode: firstAddress.postalCode || '',
                phoneNumber: firstAddress.mobileNumber || '',
              });
            }
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              name: userName || user.email,
              addresses: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setIsInitialLoad(false);
        }
      };
      fetchAddresses();
    }
  }, [user, isInitialLoad, userName]);

  // Save addresses to Firebase whenever they change (after initial load)
  useEffect(() => {
    if (user && !isInitialLoad && addresses.length >= 0) {
      const saveAddresses = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            addresses: addresses,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Addresses saved to Firebase:', addresses);
        } catch (error) {
          console.error('❌ Error saving addresses:', error);
        }
      };
      saveAddresses();
    }
  }, [addresses, user, isInitialLoad]);

  useEffect(() => {
    if (!loading && !user) {
      alert("You must be logged in to access checkout.");
      window.location.href = "/";
    }
  }, [user, loading]);

  const handleSaveAddress = (address: AddressFormData) => {
    if (editingIndex !== null) {
      const updated = [...addresses];
      updated[editingIndex] = address;
      setAddresses(updated);
      setEditingIndex(null);
    } else {
      setAddresses([...addresses, address]);
      if (addresses.length === 0) setSelectedAddressIndex(0);
    }
  };

  const handleEditAddress = (index: number) => {
    setEditingIndex(index);
    setShowAddressModal(true);
  };

  const handleRemoveAddress = (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    if (selectedAddressIndex === index) {
      setSelectedAddressIndex(updated.length > 0 ? 0 : null);
    } else if (selectedAddressIndex && selectedAddressIndex > index) {
      setSelectedAddressIndex(selectedAddressIndex - 1);
    }
  };

  // Validate form fields
  const validateInformationTab = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.state.trim()) errors.state = 'State/Region is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMoveToShipping = () => {
    if (validateInformationTab()) {
      // Create address object from form data
      const newAddress: AddressFormData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        state: formData.state,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        mobileNumber: formData.phoneNumber,
      };

      console.log('[Checkout] Saving address:', newAddress);

      // Always update or add the address
      if (addresses.length === 0) {
        // No addresses exist, add new one
        const newAddresses = [newAddress];
        setAddresses(newAddresses);
        setSelectedAddressIndex(0);
        console.log('[Checkout] Address saved, moving to shipping');
      } else {
        // Update the selected address or add new one
        const updated = [...addresses];
        if (selectedAddressIndex !== null) {
          updated[selectedAddressIndex] = newAddress;
        } else {
          updated.push(newAddress);
          setSelectedAddressIndex(updated.length - 1);
        }
        setAddresses(updated);
        console.log('[Checkout] Address updated, moving to shipping');
      }

      // Move to shipping tab after state update
      setTimeout(() => setCurrentTab('shipping'), 0);
    } else {
      toast.error('Please fill all required fields', { style: { borderRadius: 0 } });
    }
  };

  const handleBackToInformation = () => {
    setCurrentTab('information');
  };

  const handleBackToShipping = () => {
    setCurrentTab('shipping');
  };

  const handlePayment = async () => {
    // ✅ ENHANCED VALIDATION
    console.log('[Checkout Payment] Validation starting...');
    console.log('[Checkout Payment] User:', user?.uid);
    console.log('[Checkout Payment] Cart items:', cartItems.length);
    console.log('[Checkout Payment] Direct buy data:', directBuyData);
    console.log('[Checkout Payment] Addresses:', addresses);
    console.log('[Checkout Payment] Selected index:', selectedAddressIndex);
    
    if (!user || !user.uid) {
      alert("You must be logged in to place an order.");
      window.location.href = "/";
      return;
    }

    if (cartItems.length === 0 && !directBuyData) {
      alert("Your cart is empty.");
      return;
    }

    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      console.error('[Checkout Payment] Address validation failed:', {
        selectedAddressIndex,
        addressExists: selectedAddressIndex !== null ? !!addresses[selectedAddressIndex] : false,
        allAddresses: addresses
      });
      alert("Please select a delivery address.");
      setCurrentTab('information');
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment system is loading... please wait 2 seconds and try again.");
      return;
    }

    try {
      const selectedAddress = addresses[selectedAddressIndex];
      const currentTotal = subtotal - discountAmount + shipping + tax;

      console.log("[Checkout] Payment initiated with total:", currentTotal);

      const orderRes = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(currentTotal) }),
      });

      console.log("[Checkout] API Response status:", orderRes.status);

      const orderData = await orderRes.json();
      
      console.log("[Checkout] API Response data:", orderData);

      if (!orderRes.ok) {
        const errorMsg = orderData?.error || orderData?.message || 'Failed to create order';
        console.error("Order API Error:", {
          status: orderRes.status,
          statusText: orderRes.statusText,
          data: orderData
        });
        alert(`Payment error: ${errorMsg}`);
        return;
      }

      const order = orderData;

      if (!order || !order.id) {
        console.error("Razorpay order error:", order);
        alert("Unable to initialize payment. Invalid response from server.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "COGA",
        description: "Order Payment",
        order_id: order.id,

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Build items array - use directBuyData if cart is empty
            let orderItems = cartItems;
            let totalProducts = cartItems.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);

            if (cartItems.length === 0 && directBuyData) {
              orderItems = [{
                productId: directBuyData.productId,
                title: directBuyData.productTitle,
                price: directBuyData.price,
                quantity: directBuyData.quantity,
                size: directBuyData.size,
                color: directBuyData.color
              }];
              totalProducts = directBuyData.quantity || 1;
            }

            const payload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order: {
                userId: user.uid,
                userEmail: user.email || null,
                customerName: userName || user.email || null,
                amount: currentTotal,
                totalProducts,
                items: orderItems,
                address: selectedAddress,
                paymentMode: 'online'
              }
            };

            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson?.success) {
              console.error('Server verification failed', verifyJson);
              throw new Error(verifyJson?.error || 'Verification failed');
            }

            clearCart();
            sessionStorage.removeItem('directBuyData');
            window.location.href = "/success";
          } catch (err) {
            console.error('Error saving order to server:', err);
            alert('Payment succeeded but saving order failed. Contact support.');
          }
        },

        prefill: {
          name: userName || user.email || "",
          email: user.email || "",
          contact: selectedAddress?.mobileNumber || "",
        },

        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error initiating payment. Please try again.');
    }
  };

  const handleCODOrder = async () => {
    // Validation
    console.log('[Checkout COD] Validation starting...');
    console.log('[Checkout COD] User:', user?.uid);
    console.log('[Checkout COD] Cart items:', cartItems.length);
    console.log('[Checkout COD] Direct buy data:', directBuyData);
    console.log('[Checkout COD] Addresses:', addresses);
    console.log('[Checkout COD] Selected index:', selectedAddressIndex);
    
    if (!user || !user.uid) {
      alert("You must be logged in to place an order.");
      window.location.href = "/";
      return;
    }

    if (cartItems.length === 0 && !directBuyData) {
      alert("Your cart is empty.");
      return;
    }

    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      console.error('[Checkout COD] Address validation failed:', {
        selectedAddressIndex,
        addressExists: selectedAddressIndex !== null ? !!addresses[selectedAddressIndex] : false,
        allAddresses: addresses
      });
      alert("Please select a delivery address.");
      setCurrentTab('information');
      return;
    }

    const selectedAddress = addresses[selectedAddressIndex];
    
    // Build items array - use directBuyData if cart is empty
    let orderItems = cartItems;
    let totalProducts = cartItems.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);

    if (cartItems.length === 0 && directBuyData) {
      orderItems = [{
        productId: directBuyData.productId,
        title: directBuyData.productTitle,
        price: directBuyData.price,
        quantity: directBuyData.quantity,
        size: directBuyData.size,
        color: directBuyData.color
      }];
      totalProducts = directBuyData.quantity || 1;
    }

    try {
      const payload = {
        order: {
          userId: user.uid,
          userEmail: user.email || null,
          customerName: userName || user.email || null,
          amount: total,
          totalProducts,
          items: orderItems,
          address: selectedAddress,
          paymentMode: 'cod',
          paymentStatus: 'Pending'
        }
      };

      const response = await fetch('/api/place-cod-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to place order');
      }

      clearCart();
      sessionStorage.removeItem('directBuyData');
      window.location.href = "/success?payment=cod";
    } catch (error) {
      console.error('Error placing COD order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          {/* Back Button */}
          <motion.button 
            onClick={() => window.history.back()} 
            className="mb-6 text-gray-600 hover:text-black flex items-center gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ x: -5 }}
          >
            <span>←</span>
          </motion.button>

          {/* Header */}
          <motion.h1 
            className="text-4xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            CHECKOUT
          </motion.h1>

          {/* Tabs */}
          <motion.div 
            className="flex gap-8 mb-8 border-b border-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            suppressHydrationWarning
          >
            <button onClick={() => setCurrentTab('information')} className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === 'information' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`} suppressHydrationWarning>
              INFORMATION
            </button>
            <button 
              onClick={() => {
                if (addresses.length > 0 && selectedAddressIndex !== null) {
                  setCurrentTab('shipping');
                }
              }} 
              className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === 'shipping' ? 'text-black border-b-2 border-black' : (addresses.length === 0 || selectedAddressIndex === null) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-400'}`}
              suppressHydrationWarning
            >
              SHIPPING
            </button>
            <button 
              onClick={() => {
                if (addresses.length > 0 && selectedAddressIndex !== null) {
                  setCurrentTab('payment');
                }
              }} 
              className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === 'payment' ? 'text-black border-b-2 border-black' : (addresses.length === 0 || selectedAddressIndex === null) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-400'}`}
              suppressHydrationWarning
            >
              PAYMENT
            </button>
          </motion.div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" suppressHydrationWarning>
            {/* LEFT SECTION - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8">
                {currentTab === 'information' && (
                  <>
                    {/* Contact Info */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold mb-4">CONTACT INFO</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 text-sm mb-3"
                        placeholder="Email"
                      />
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold mb-4">SHIPPING ADDRESS</label>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <input 
                            type="text" 
                            placeholder="First Name *" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className={`w-full px-4 py-3 border text-sm ${formErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          />
                          {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                        </div>
                        <div>
                          <input 
                            type="text" 
                            placeholder="Last Name *" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className={`w-full px-4 py-3 border text-sm ${formErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          />
                          {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <select 
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                          className={`w-full px-4 py-3 border text-sm mb-4 bg-white ${formErrors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        >
                          <option value="">Select Country *</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                        {formErrors.country && <p className="text-red-500 text-xs mt-1 mb-2">{formErrors.country}</p>}
                      </div>

                      <div>
                        <input 
                          type="text" 
                          placeholder="State / Region *" 
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          className={`w-full px-4 py-3 border text-sm mb-4 ${formErrors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        {formErrors.state && <p className="text-red-500 text-xs mt-1 mb-2">{formErrors.state}</p>}
                      </div>

                      <div>
                        <input 
                          type="text" 
                          placeholder="Address *" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className={`w-full px-4 py-3 border text-sm mb-4 ${formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        {formErrors.address && <p className="text-red-500 text-xs mt-1 mb-2">{formErrors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <input 
                            type="text" 
                            placeholder="City *" 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className={`w-full px-4 py-3 border text-sm ${formErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          />
                          {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                        </div>
                        <div>
                          <input 
                            type="text" 
                            placeholder="Postal Code *" 
                            value={formData.postalCode}
                            onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                            className={`w-full px-4 py-3 border text-sm ${formErrors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          />
                          {formErrors.postalCode && <p className="text-red-500 text-xs mt-1">{formErrors.postalCode}</p>}
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          className={`w-full px-4 py-3 border text-sm mb-6 ${formErrors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1 mb-2">{formErrors.phoneNumber}</p>}
                      </div>

                      {/* Shipping Button */}
                      <button onClick={handleMoveToShipping} className="flex items-center gap-2 text-sm font-bold bg-black text-white hover:bg-gray-900 px-6 py-3 transition">
                        Shipping <span className="ml-2">→</span>
                      </button>
                    </div>
                  </>
                )}

                {currentTab === 'shipping' && (
                  <>
                    {/* Display Selected Address */}
                    {selectedAddressIndex !== null && addresses[selectedAddressIndex] && (
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                        <h3 className="text-sm font-bold mb-2">SHIPPING TO:</h3>
                        <p className="text-sm">
                          {addresses[selectedAddressIndex].firstName} {addresses[selectedAddressIndex].lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addresses[selectedAddressIndex].address}, {addresses[selectedAddressIndex].city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addresses[selectedAddressIndex].state}, {addresses[selectedAddressIndex].country} - {addresses[selectedAddressIndex].postalCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {addresses[selectedAddressIndex].mobileNumber}
                        </p>
                        <button 
                          onClick={handleBackToInformation}
                          className="text-blue-600 text-xs font-semibold hover:underline mt-2"
                        >
                          Change Address
                        </button>
                      </div>
                    )}

                    <h2 className="text-2xl font-bold mb-6">Shipping Method</h2>
                    <div className="space-y-4 mb-8">
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="w-5 h-5 mt-0.5 cursor-pointer" 
                        />
                        <div className="flex-1">
                          <span className="font-semibold block mb-1">Standard Shipping (5-7 days)</span>
                          <span className="text-sm text-gray-600">Free</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="w-5 h-5 mt-0.5 cursor-pointer" 
                        />
                        <div className="flex-1">
                          <span className="font-semibold block mb-1">Express Shipping (2-3 days)</span>
                          <span className="text-sm text-gray-600">₹200</span>
                        </div>
                      </label>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleBackToInformation} 
                        className="flex items-center gap-2 text-sm font-bold border-2 border-black text-black hover:bg-gray-100 px-6 py-3 transition"
                      >
                        <span className="mr-2">←</span> Back
                      </button>
                      <button 
                        onClick={() => setCurrentTab('payment')} 
                        className="flex items-center gap-2 text-sm font-bold bg-black text-white hover:bg-gray-900 px-6 py-3 transition"
                      >
                        Continue to Payment <span className="ml-2">→</span>
                      </button>
                    </div>
                  </>
                )}

                {currentTab === 'payment' && (
                  <>
                    {/* Display Selected Address */}
                    {selectedAddressIndex !== null && addresses[selectedAddressIndex] && (
                      <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                        <h3 className="text-sm font-bold mb-2">SHIPPING TO:</h3>
                        <p className="text-sm">
                          {addresses[selectedAddressIndex].firstName} {addresses[selectedAddressIndex].lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addresses[selectedAddressIndex].address}, {addresses[selectedAddressIndex].city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addresses[selectedAddressIndex].state}, {addresses[selectedAddressIndex].country} - {addresses[selectedAddressIndex].postalCode}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Phone: {addresses[selectedAddressIndex].mobileNumber}
                        </p>
                        <p className="text-sm font-semibold">
                          Shipping: {shippingMethod === 'express' ? 'Express (2-3 days) - ₹200' : 'Standard (5-7 days) - Free'}
                        </p>
                        <button 
                          onClick={handleBackToInformation}
                          className="text-blue-600 text-xs font-semibold hover:underline mt-2"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                    <div className="space-y-3 mb-6">
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 cursor-pointer transition-all hover:border-gray-400">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-black w-5 h-5 mt-0.5 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium block mb-1">Cash on Delivery</span>
                          <span className="text-xs text-gray-600">Pay when your order arrives</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 cursor-pointer transition-all hover:border-gray-400">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="accent-black w-5 h-5 mt-0.5 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium block mb-1">Online Payment</span>
                          <span className="text-xs text-gray-600">UPI, Cards, Net Banking</span>
                        </div>
                      </label>
                    </div>

                    {/* Payment Button */}
                    <div className="flex gap-4">
                      <button 
                        onClick={handleBackToShipping} 
                        className="flex items-center gap-2 text-sm font-bold border-2 border-black text-black hover:bg-gray-100 px-6 py-3 transition"
                      >
                        <span className="mr-2">←</span> Back
                      </button>
                      {paymentMethod === 'online' ? (
                        <button
                          onClick={handlePayment}
                          className="flex-1 bg-black text-white py-3.5 cursor-pointer hover:bg-gray-900 transition-colors font-semibold text-base"
                        >
                          Pay ₹{total.toFixed(2)}
                        </button>
                      ) : (
                        <button
                          onClick={handleCODOrder}
                          className="flex-1 bg-black text-white py-3.5 cursor-pointer hover:bg-gray-900 transition-colors font-semibold text-base"
                        >
                          Place Order (₹{total.toFixed(2)})
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT SECTION - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">YOUR ORDER</h2>
                  <span className="text-sm text-gray-600">({directBuyData && cartItems.length === 0 ? directBuyData.quantity || 1 : cartCount})</span>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {directBuyData && cartItems.length === 0 ? (
                    // Display direct buy item
                    <div className="border-b pb-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-20 bg-gray-200 flex-shrink-0 relative">
                          {directBuyData.image && (
                            <Image
                              src={directBuyData.image}
                              alt={directBuyData.productTitle || 'Product'}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">{directBuyData.productTitle}</p>
                          <p className="text-xs text-gray-600 mb-2">{directBuyData.size || 'One size'}</p>
                          <p className="text-sm font-bold">₹{(Number(directBuyData.price) * (directBuyData.quantity || 1)).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button onClick={() => window.location.href = '/products'} className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">Change</button>
                          <span className="text-xs">({directBuyData.quantity || 1})</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display cart items
                    cartItems.map((it, i) => (
                      <div key={`prod-${(it as any).uniqueKey || i}`} className="border-b pb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-20 bg-gray-200 flex-shrink-0 relative">
                            {it.image && (
                              <Image
                                src={it.image}
                                alt={it.title || 'Product'}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">{it.title}</p>
                            <p className="text-xs text-gray-600 mb-2">{it.size || 'One size'}</p>
                            <p className="text-sm font-bold">₹{((it.price ?? 0) * it.quantity).toFixed(2)}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button onClick={() => window.location.href = '/products'} className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">Change</button>
                            <span className="text-xs">({it.quantity})</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping > 0 ? "font-semibold" : "text-green-600 font-semibold"}>
                      {shipping > 0 ? `₹${shipping}` : 'Free'}
                    </span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Modal */}
          <AddressModal
            isOpen={showAddressModal}
            onClose={() => setShowAddressModal(false)}
            onSave={handleSaveAddress}
            initialData={editingIndex !== null ? addresses[editingIndex] : undefined}
          />
        </div>
      </motion.div>
      <Footer />
    </>
  );
}