'use client';

import React, { useEffect, useState } from "react";
import { Albert_Sans } from "next/font/google";
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

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});


export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user, loading } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(0);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [currentTab, setCurrentTab] = useState<'information' | 'shipping' | 'payment'>('information');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

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

  // --- Combo grouping & pricing logic ---
  const comboGroups: Record<string, { items: any[]; required: number; offerPrice: number; total: number }> = {};
  cartItems.forEach((item: any) => {
    if (item.isCombo) {
      const key = item.comboKey || item.productId || item.id || item.title;
      if (!comboGroups[key]) {
        comboGroups[key] = {
          items: [],
          required: item.comboQuantity ?? 0,
          offerPrice: item.comboOfferPrice ?? 0,
          total: 0,
        };
      }
      comboGroups[key].items.push(item);
      comboGroups[key].total += item.quantity || 0;
    }
  });

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

  let subtotal = 0;
  Object.values(comboGroups).forEach(group => {
    if (group.required > 0 && group.total === group.required && group.offerPrice) {
      subtotal += group.offerPrice;
    } else {
      subtotal += group.items.reduce((sum, it) => sum + ((it.price ?? 0) * (it.quantity || 0)), 0);
    }
  });
  cartItems.filter(it => !it.isCombo).forEach(it => {
    subtotal += (it.price ?? 0) * it.quantity;
  });
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
            if (userData.addresses && Array.isArray(userData.addresses)) {
              setAddresses(userData.addresses);
              setSelectedAddressIndex(userData.addresses.length > 0 ? 0 : null);
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

  const handlePayment = async () => {
    // ✅ ENHANCED VALIDATION
    if (!user || !user.uid) {
      alert("You must be logged in to place an order.");
      window.location.href = "/";
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      alert("Please select a delivery address.");
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
            const totalProducts = cartItems.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);

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
                items: cartItems,
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
    if (!user || !user.uid) {
      alert("You must be logged in to place an order.");
      window.location.href = "/";
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      alert("Please select a delivery address.");
      return;
    }

    const selectedAddress = addresses[selectedAddressIndex];
    const totalProducts = cartItems.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);

    try {
      const payload = {
        order: {
          userId: user.uid,
          userEmail: user.email || null,
          customerName: userName || user.email || null,
          amount: total,
          totalProducts,
          items: cartItems,
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
        className={`min-h-screen bg-gray-50 ${albertSans.className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
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
          >
            <button onClick={() => setCurrentTab('information')} className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === 'information' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>
              INFORMATION
            </button>
            <button onClick={() => setCurrentTab('shipping')} className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === 'shipping' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>
              SHIPPING
            </button>
            <button onClick={() => setCurrentTab('payment')} className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === 'payment' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>
              PAYMENT
            </button>
          </motion.div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        <input type="text" placeholder="First Name" className="w-full px-4 py-3 border border-gray-300 text-sm" />
                        <input type="text" placeholder="Last Name" className="w-full px-4 py-3 border border-gray-300 text-sm" />
                      </div>

                      <select className="w-full px-4 py-3 border border-gray-300 text-sm mb-4 bg-white">
                        <option value="">Select Country</option>
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>

                      <input type="text" placeholder="State / Region" className="w-full px-4 py-3 border border-gray-300 text-sm mb-4" />
                      <input type="text" placeholder="Address" className="w-full px-4 py-3 border border-gray-300 text-sm mb-4" />

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="City" className="w-full px-4 py-3 border border-gray-300 text-sm" />
                        <input type="text" placeholder="Postal Code" className="w-full px-4 py-3 border border-gray-300 text-sm" />
                      </div>

                      {/* Phone Number */}
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 border border-gray-300 text-sm mb-6"
                      />

                      {/* Shipping Button */}
                      <button onClick={() => setCurrentTab('shipping')} className="flex items-center gap-2 text-sm font-bold bg-black text-white hover:bg-gray-900 px-6 py-3 transition">
                        Shipping <span className="ml-2">→</span>
                      </button>
                    </div>
                  </>
                )}

                {currentTab === 'shipping' && (
                  <>
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
                    <button onClick={() => setCurrentTab('payment')} className="flex items-center gap-2 text-sm font-bold bg-black text-white hover:bg-gray-900 px-6 py-3 transition">
                      Payment <span className="ml-2">→</span>
                    </button>
                  </>
                )}

                {currentTab === 'payment' && (
                  <>
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
                    {paymentMethod === 'online' ? (
                      <button
                        onClick={handlePayment}
                        className="bg-black text-white w-full py-3.5 cursor-pointer hover:bg-gray-900 transition-colors font-semibold text-base"
                      >
                        Pay ₹{total.toFixed(2)}
                      </button>
                    ) : (
                      <button
                        onClick={handleCODOrder}
                        className="bg-black text-white w-full py-3.5 cursor-pointer hover:bg-gray-900 transition-colors font-semibold text-base"
                      >
                        Place Order (₹{total.toFixed(2)})
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT SECTION - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">YOUR ORDER</h2>
                  <span className="text-sm text-gray-600">({cartCount})</span>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {Object.values(comboGroups).map((group: any, idx: number) => (
                    group.total === group.required && group.offerPrice ? (
                      <div key={`combo-${idx}`} className="border-b pb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-20 bg-gray-200 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">{group.items[0].title}</p>
                            <p className="text-xs text-gray-600 mb-2">{group.items[0].size || 'One size'}</p>
                            <p className="text-sm font-bold">₹{group.offerPrice.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button className="text-blue-600 text-xs font-semibold">Change</button>
                            <span className="text-xs">({group.total})</span>
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}

                  {cartItems
                    .filter(item => {
                      const key = (item as any).comboKey || (item as any).productId;
                      const group: any = key ? comboGroups[key] : null;
                      const isCompletedComboItem = group && group.total === group.required && group.offerPrice && item.isCombo;
                      return !isCompletedComboItem;
                    })
                    .map((it, i) => (
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
                            <button className="text-blue-600 text-xs font-semibold">Change</button>
                            <span className="text-xs">({it.quantity})</span>
                          </div>
                        </div>
                      </div>
                    ))}
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