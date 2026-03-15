"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, db } from "../../../src/context/authProvider";
import { useCart } from "@/src/context/CartContext";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  getGuestUserInfo,
  clearGuestSession,
} from "@/src/server/services/phoneAuth.service";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { Check } from "lucide-react";
import AddressModal from "@/src/components/forms/addressModal";
import { AddressFormData } from "@/src/server/models/address.model";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    number | null
  >(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState("");
  const [currentTab, setCurrentTab] = useState<
    "information" | "shipping" | "payment"
  >("information");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );
  const [directBuyData, setDirectBuyData] = useState<any>(null);

  // Phone-based checkout states
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [guestPhoneNumber, setGuestPhoneNumber] = useState<string | null>(null);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  // Form state for information tab
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    state: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);

    // Check for guest user from phone verification
    const guestInfo = getGuestUserInfo();
    if (guestInfo) {
      setGuestUserId(guestInfo.userId);
      setGuestPhoneNumber(guestInfo.phoneNumber);
      setIsGuestCheckout(true);
    }

    // If not logged in and no guest ID, generate one
    if (!user && !guestInfo) {
      const tempGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setGuestUserId(tempGuestId);
      sessionStorage.setItem("tempGuestUserId", tempGuestId);
    }

    // Load direct buy data from sessionStorage if available
    const savedDirectBuyData = sessionStorage.getItem("directBuyData");
    if (savedDirectBuyData) {
      try {
        const data = JSON.parse(savedDirectBuyData);
        setDirectBuyData(data);
      } catch (e) {}
    }
  }, [user]);

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

    const match = allCoupons.find((c) => c.code === couponInput.trim());

    if (!match) {
      toast.error("Invalid coupon code", { style: { borderRadius: 0 } });
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(match);
    toast.success(`Coupon applied: ${match.discount}% OFF`, {
      style: { borderRadius: 0 },
    });
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
    cartItems.forEach((it) => {
      subtotal += (it.price ?? 0) * it.quantity;
    });
  }

  const shipping = shippingMethod === "express" ? 200 : 0;
  // const tax = subtotal > 0 ? Math.round(subtotal * 0.02) : 0;
  const tax = 0;
  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discount) / 100)
    : 0;
  const codCharge = paymentMethod === "cod" ? 40 : 0;

  const total = subtotal - discountAmount + shipping + tax + codCharge;

  // Fetch user data (for logged-in users)
  useEffect(() => {
    if (user) {
      const fetchUserName = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || user.email);
          } else {
            setUserName(user.email);
          }
        } catch (error) {
          setUserName(user.email);
        }
      };
      fetchUserName();
    } else if (isGuestCheckout && guestUserId) {
      // For guest checkout with phone verification
      setUserName("Guest User");
    } else {
      setUserName(null);
    }
  }, [user, isGuestCheckout, guestUserId]);

  // Load addresses from Firestore
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const userId = user?.uid || guestUserId;
        if (!userId) {
          setIsInitialLoad(false);
          return;
        }

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (
            userData.addresses &&
            Array.isArray(userData.addresses) &&
            userData.addresses.length > 0
          ) {
            setAddresses(userData.addresses);
            setSelectedAddressIndex(0);

            // Populate form with first address
            const firstAddress = userData.addresses[0];
            setFormData({
              firstName: firstAddress.firstName || "",
              lastName: firstAddress.lastName || "",
              email: formData.email || "",
              country: firstAddress.country || "",
              state: firstAddress.state || "",
              address: firstAddress.address || "",
              city: firstAddress.city || "",
              postalCode: firstAddress.postalCode || "",
              phoneNumber: firstAddress.mobileNumber || guestPhoneNumber || "",
            });
          }
        } else {
          // Create user document if it doesn't exist
          await setDoc(doc(db, "users", userId), {
            email: user?.email || null,
            phoneNumber: guestPhoneNumber || null,
            name: userName || user?.email || "Guest User",
            addresses: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            accountType: isGuestCheckout ? "phone" : "email",
          });
        }
        setIsInitialLoad(false);
      } catch (error) {
        setIsInitialLoad(false);
      }
    };

    if ((user || isGuestCheckout) && isInitialLoad) {
      fetchAddresses();
    }
  }, [
    user,
    isGuestCheckout,
    guestUserId,
    guestPhoneNumber,
    isInitialLoad,
    userName,
  ]);

  // Save addresses to Firebase whenever they change
  useEffect(() => {
    const saveAddresses = async () => {
      try {
        const userId = user?.uid || guestUserId;
        if (!userId || isInitialLoad || addresses.length < 0) return;

        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          addresses: addresses,
          updatedAt: serverTimestamp(),
        });
        console.log("✅ Addresses saved to Firebase:", addresses);
      } catch (error) {}
    };

    if ((user || isGuestCheckout) && !isInitialLoad && addresses.length >= 0) {
      saveAddresses();
    }
  }, [addresses, user, isGuestCheckout, guestUserId, isInitialLoad]);

  // Check auth on page load
  useEffect(() => {
    if (!loading) {
      // If not logged in and not guest, show phone verification
      if (!user && !isGuestCheckout) {
        setShowPhoneVerification(true);
      }
    }
  }, [user, loading, isGuestCheckout]);

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

  // Handle phone verification completion
  const handlePhoneVerificationComplete = (
    userId: string,
    phoneNumber: string,
  ) => {
    setGuestUserId(userId);
    setGuestPhoneNumber(phoneNumber);
    setIsGuestCheckout(true);
    setShowPhoneVerification(false);

    // Pre-fill phone number in form
    setFormData((prev) => ({
      ...prev,
      phoneNumber: phoneNumber,
    }));
  };

  // Validate form fields
  const validateInformationTab = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    // Email validation - required for guest users, optional for logged-in users
    if (!user?.email) {
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!formData.country) errors.country = "Country is required";
    if (!formData.state.trim()) errors.state = "State/Region is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.postalCode.trim())
      errors.postalCode = "Postal code is required";
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    }

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

      // Always update or add the address
      if (addresses.length === 0) {
        // No addresses exist, add new one
        const newAddresses = [newAddress];
        setAddresses(newAddresses);
        setSelectedAddressIndex(0);
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
      }

      // Save email to user document for guest users
      if (!user && guestUserId && formData.email) {
        const userRef = doc(db, "users", guestUserId);
        updateDoc(userRef, {
          email: formData.email,
          updatedAt: serverTimestamp(),
        }).catch((err) => console.error("Error saving email:", err));
      }

      // Move to shipping tab after state update
      setTimeout(() => setCurrentTab("shipping"), 0);
    } else {
      toast.error("Please fill all required fields", {
        style: { borderRadius: 0 },
      });
    }
  };

  const handleBackToInformation = () => {
    setCurrentTab("information");
  };

  const handleBackToShipping = () => {
    setCurrentTab("shipping");
  };

  const handlePayment = async () => {
    // Track InitiateCheckout event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout");
    }

    // ✅ ENHANCED VALIDATION
    const userId = user?.uid || guestUserId;

    if (!userId) {
      alert("Please verify your phone number to place an order.");
      setShowPhoneVerification(true);
      return;
    }

    if (cartItems.length === 0 && !directBuyData) {
      alert("Your cart is empty.");
      return;
    }

    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      alert("Please select a delivery address.");
      setCurrentTab("information");
      return;
    }

    try {
      const selectedAddress = addresses[selectedAddressIndex];
      const codChargeForPayment = paymentMethod === "cod" ? 40 : 0;
      const currentTotal =
        subtotal - discountAmount + shipping + tax + codChargeForPayment;

      // Create guest account if not logged in
      if (!user && guestPhoneNumber) {
        console.log("� [GUEST AUTH] Starting guest account creation");
        console.log("🔵 [GUEST AUTH] Guest phone number:", guestPhoneNumber);
        console.log("🔵 [GUEST AUTH] User name:", userName);

        try {
          const guestRes = await fetch("/api/create-guest-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: guestPhoneNumber,
              name: userName,
              email: formData.email || null,
            }),
          });

          console.log("🔵 [GUEST AUTH] API Response status:", guestRes.status);
          const guestData = await guestRes.json();
          console.log("🔵 [GUEST AUTH] API Response data:", guestData);

          if (guestData.success) {
            console.log(
              "✅ [GUEST AUTH] Guest account created with UID:",
              guestData.uid,
            );
            console.log("✅ [GUEST AUTH] Guest email:", guestData.email);
            console.log(
              "✅ [GUEST AUTH] Guest password exists:",
              !!guestData.password,
            );

            // Sign in the guest user on the frontend
            try {
              console.log("🔵 [GUEST AUTH] Attempting to sign in...");
              const auth = getAuth();
              console.log("🔵 [GUEST AUTH] Auth instance:", !!auth);

              const userCredential = await signInWithEmailAndPassword(
                auth,
                guestData.email,
                guestData.password,
              );
              console.log("✅ [GUEST AUTH] Guest signed in successfully!");
              console.log("✅ [GUEST AUTH] User UID:", userCredential.user.uid);
              console.log(
                "✅ [GUEST AUTH] User email:",
                userCredential.user.email,
              );
            } catch (signInError: any) {
              console.error(
                "❌ [GUEST AUTH] Sign in error:",
                signInError.code,
                signInError.message,
              );
            }

            // Store UID and phone
            localStorage.setItem("guestUID", guestData.uid);
            localStorage.setItem("guestPhoneNumber", guestPhoneNumber);
            sessionStorage.setItem("guestUID", guestData.uid);
            console.log(
              "✅ [GUEST AUTH] Stored in localStorage - UID:",
              guestData.uid,
            );
            console.log(
              "✅ [GUEST AUTH] Stored in localStorage - Phone:",
              guestPhoneNumber,
            );
          } else {
            console.warn(
              "❌ [GUEST AUTH] Guest account creation failed:",
              guestData.error,
            );
          }
        } catch (guestError: any) {
          console.error("❌ [GUEST AUTH] Fetch error:", guestError.message);
        }
      } else {
        console.log(
          "⚠️ [GUEST AUTH] Skipping guest auth - user:",
          !!user,
          "phone:",
          guestPhoneNumber,
        );
      }

      const orderRes = await fetch("/api/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(currentTotal),
          customerId: userId,
          customerEmail: user?.email || null,
          customerPhone:
            selectedAddress?.mobileNumber || guestPhoneNumber || "9000000000",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        const errorMsg =
          orderData?.error || orderData?.message || "Failed to create order";
        alert(`Payment error: ${errorMsg}`);
        return;
      }

      // Build items array - use directBuyData if cart is empty
      let orderItems = cartItems.map((item) => ({
        id:
          (item as any).id ||
          (item as any).productId ||
          (item as any).bundleId ||
          "",
        productId:
          (item as any).productId ||
          (item as any).id ||
          (item as any).bundleId ||
          "",
        title: item.title || "",
        price: item.price || 0,
        quantity: item.quantity || 1,
        size: item.size || "",
        color: item.color || {},
        image: item.image || "",
        // ✅ Preserve bundle metadata
        bundleId: (item as any).bundleId,
        isBundleItem: (item as any).isBundleItem,
        bundlePrice: (item as any).bundlePrice,
        bundleName: (item as any).bundleName,
        originalIndividualPrice: (item as any).originalIndividualPrice,
        bundleProductSizes: (item as any).bundleProductSizes, // For pre-configured bundles
        // ✅ Flexible bundle fields
        isFlexibleBundle: (item as any).isFlexibleBundle,
        flexibleBundleItems: (item as any).flexibleBundleItems,
      }));
      let totalProducts = cartItems.reduce(
        (sum: number, it: any) => sum + (it.quantity || 0),
        0,
      );

      if (cartItems.length === 0 && directBuyData) {
        orderItems = [
          {
            id: directBuyData.productId || "",
            productId: directBuyData.productId || "",
            title: directBuyData.productTitle || "",
            price: directBuyData.price || 0,
            quantity: directBuyData.quantity || 1,
            size: directBuyData.size || "",
            color: directBuyData.color || {},
            image: directBuyData.image || "",
            bundleId: undefined,
            isBundleItem: false,
            bundlePrice: undefined,
            bundleName: undefined,
            originalIndividualPrice: undefined,
            bundleProductSizes: undefined,
            isFlexibleBundle: false,
            flexibleBundleItems: undefined,
          },
        ];
        totalProducts = directBuyData.quantity || 1;
      }

      // Store order details in session storage for use after payment
      const orderPayload = {
        userId: userId,
        userEmail: user?.email || null,
        phoneNumber: guestPhoneNumber || null,
        customerName: userName || user?.email || "Guest User",
        amount: currentTotal,
        totalProducts,
        items: orderItems,
        address: selectedAddress,
        paymentMode: "online",
        razorpayOrderId: orderData.order_id,
      };

      sessionStorage.setItem("pendingOrder", JSON.stringify(orderPayload));
      sessionStorage.setItem("razorpayOrderId", orderData.order_id);

      // Store guest UID and phone for after payment redirect
      if (guestPhoneNumber) {
        localStorage.setItem("guestPhoneNumber", guestPhoneNumber);
        console.log("✅ Guest phone stored for redirect");
      }

      // Open Razorpay payment modal
      // @ts-ignore
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        // @ts-ignore
        const rzp = new window.Razorpay({
          key: orderData.key_id,
          order_id: orderData.order_id,
          handler: function (response: any) {
            window.location.href = `/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
          },
          prefill: {
            name: userName || user?.email || "Guest",
            email: user?.email || "",
            contact:
              selectedAddress?.mobileNumber || guestPhoneNumber || "9000000000",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: () => {
              alert("Payment cancelled");
            },
          },
        });
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      alert("Error initiating payment. Please try again.");
    }
  };

  const handleCODOrder = async (): Promise<void> => {
    // Track InitiateCheckout event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout");
    }

    // Utility function to remove undefined values from objects
    const removeUndefinedValues = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(removeUndefinedValues);
      } else if (obj !== null && typeof obj === "object") {
        return Object.entries(obj)
          .filter(([, value]) => value !== undefined)
          .reduce((acc, [key, value]) => {
            acc[key] = removeUndefinedValues(value);
            return acc;
          }, {} as any);
      }
      return obj;
    };

    // Validation
    const userId = user?.uid || guestUserId;

    if (!userId) {
      alert("Please verify your phone number to place an order.");
      setShowPhoneVerification(true);
      return;
    }

    if (cartItems.length === 0 && !directBuyData) {
      alert("Your cart is empty.");
      return;
    }

    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      alert("Please select a delivery address.");
      setCurrentTab("information");
      return;
    }

    setIsPlacingOrder(true);
    console.log("🔵 [COD ORDER] Starting COD order placement...");

    const selectedAddress = addresses[selectedAddressIndex];

    // Build items array - use directBuyData if cart is empty
    let orderItems = cartItems.map((item) => ({
      id:
        (item as any).id ||
        (item as any).productId ||
        (item as any).bundleId ||
        "",
      productId:
        (item as any).productId ||
        (item as any).id ||
        (item as any).bundleId ||
        "",
      title: item.title || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
      size: item.size || "",
      color: item.color || {},
      image: item.image || "",
      // ✅ Preserve bundle metadata
      bundleId: (item as any).bundleId,
      isBundleItem: (item as any).isBundleItem,
      bundlePrice: (item as any).bundlePrice,
      bundleName: (item as any).bundleName,
      originalIndividualPrice: (item as any).originalIndividualPrice,
      bundleProductSizes: (item as any).bundleProductSizes, // For pre-configured bundles
      // ✅ Flexible bundle fields
      isFlexibleBundle: (item as any).isFlexibleBundle,
      flexibleBundleItems: (item as any).flexibleBundleItems,
    }));
    let totalProducts = cartItems.reduce(
      (sum: number, it: any) => sum + (it.quantity || 0),
      0,
    );

    if (cartItems.length === 0 && directBuyData) {
      orderItems = [
        {
          id: directBuyData.productId || "",
          productId: directBuyData.productId || "",
          title: directBuyData.productTitle || "",
          price: directBuyData.price || 0,
          quantity: directBuyData.quantity || 1,
          size: directBuyData.size || "",
          color: directBuyData.color || {},
          image: directBuyData.image || "",
          bundleId: undefined,
          isBundleItem: false,
          bundlePrice: undefined,
          bundleName: undefined,
          originalIndividualPrice: undefined,
          bundleProductSizes: undefined,
          isFlexibleBundle: false,
          flexibleBundleItems: undefined,
        },
      ];
      totalProducts = directBuyData.quantity || 1;
    }

    try {
      let finalUserId = userId;

      // Create guest account if not logged in
      if (!user && guestPhoneNumber) {
        console.log("🔵 [COD GUEST AUTH] Starting guest account creation");
        console.log(
          "🔵 [COD GUEST AUTH] Guest phone number:",
          guestPhoneNumber,
        );
        console.log("🔵 [COD GUEST AUTH] User name:", userName);

        try {
          const guestRes = await fetch("/api/create-guest-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: guestPhoneNumber,
              name: userName,
              email: formData.email || null,
            }),
          });

          console.log(
            "🔵 [COD GUEST AUTH] API Response status:",
            guestRes.status,
          );
          const guestData = await guestRes.json();
          console.log("🔵 [COD GUEST AUTH] API Response data:", guestData);

          if (guestData.success) {
            console.log(
              "✅ [COD GUEST AUTH] Guest account retrieved with UID:",
              guestData.uid,
            );
            console.log(
              "✅ [COD GUEST AUTH] Is existing account:",
              guestData.isExisting ? "YES" : "NO",
            );
            console.log("✅ [COD GUEST AUTH] Guest email:", guestData.email);
            console.log(
              "✅ [COD GUEST AUTH] Guest password exists:",
              !!guestData.password,
            );

            // Sign in the guest user on the frontend
            try {
              console.log("🔵 [COD GUEST AUTH] Attempting to sign in...");
              const auth = getAuth();
              console.log("🔵 [COD GUEST AUTH] Auth instance:", !!auth);

              const userCredential = await signInWithEmailAndPassword(
                auth,
                guestData.email,
                guestData.password,
              );
              console.log("✅ [COD GUEST AUTH] Guest signed in successfully!");
              console.log(
                "✅ [COD GUEST AUTH] User UID:",
                userCredential.user.uid,
              );
              console.log(
                "✅ [COD GUEST AUTH] User email:",
                userCredential.user.email,
              );

              // Update the local userId with the new guest user's UID
              finalUserId = userCredential.user.uid;
              setGuestUserId(userCredential.user.uid);
              console.log(
                "✅ [COD GUEST AUTH] Updated finalUserId:",
                finalUserId,
              );

              // Wait a moment for auth context to update
              await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (signInError: any) {
              console.error(
                "❌ [COD GUEST AUTH] Sign in error:",
                signInError.code,
                signInError.message,
              );
              // Use the created UID even if sign-in fails
              finalUserId = guestData.uid;
              setGuestUserId(guestData.uid);
            }

            // Store UID and phone
            localStorage.setItem("guestUID", guestData.uid);
            localStorage.setItem("guestPhoneNumber", guestPhoneNumber);
            sessionStorage.setItem("guestUID", guestData.uid);
            console.log(
              "✅ [COD GUEST AUTH] Stored in localStorage - UID:",
              guestData.uid,
            );
            console.log(
              "✅ [COD GUEST AUTH] Stored in localStorage - Phone:",
              guestPhoneNumber,
            );
          } else {
            console.warn(
              "❌ [COD GUEST AUTH] Guest account creation failed:",
              guestData.error,
            );
          }
        } catch (guestError: any) {
          console.error("❌ [COD GUEST AUTH] Fetch error:", guestError.message);
        }
      } else {
        console.log(
          "⚠️ [COD GUEST AUTH] Skipping guest auth - user:",
          !!user,
          "phone:",
          guestPhoneNumber,
        );
      }

      const payload = {
        order: {
          userId: finalUserId,
          userEmail: user?.email || null,
          phoneNumber: guestPhoneNumber || null,
          customerName: userName || user?.email || "Guest User",
          amount: total,
          totalProducts,
          items: orderItems,
          address: {
            firstName: selectedAddress.firstName || "",
            lastName: selectedAddress.lastName || "",
            address: selectedAddress.address || "",
            city: selectedAddress.city || "",
            state: selectedAddress.state || "",
            postalCode: selectedAddress.postalCode || "",
            mobileNumber: selectedAddress.mobileNumber || "",
          },
          paymentMode: "cod",
          paymentStatus: "Pending",
        },
      };

      console.log(
        "📤 Sending COD order payload:",
        JSON.stringify(payload, null, 2),
      );

      // Update guest user with actual name if not logged in
      if (!user && finalUserId && userName) {
        const userRef = doc(db, "users", finalUserId);
        await updateDoc(userRef, {
          name: userName,
          updatedAt: serverTimestamp(),
        });
      }

      const response = await fetch("/api/place-cod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("📥 COD order validation response:", {
        status: response.status,
        success: result.success,
        error: result.error,
      });

      if (!response.ok || !result?.success) {
        console.error("❌ Order validation failed:", result.error);
        toast.error(result?.error || "Failed to validate order", {
          style: { borderRadius: 0 },
        });
        return;
      }

      // ✅ Now write the order to Firestore using authenticated user
      console.log("💾 Writing COD order to Firestore...");
      console.log("📝 Using finalUserId:", finalUserId);
      console.log(
        "📋 Complete order items:",
        JSON.stringify(orderItems, null, 2),
      );
      try {
        const orderDocRef = await addDoc(
          collection(db, "orders"),
          removeUndefinedValues({
            userId: finalUserId,
            userEmail: user?.email || null,
            phoneNumber: guestPhoneNumber || null,
            customerName: userName || user?.email || "Guest User",
            amount: total,
            totalProducts,
            items: orderItems,
            address: {
              firstName: selectedAddress.firstName || "",
              lastName: selectedAddress.lastName || "",
              country: selectedAddress.country || "",
              address: selectedAddress.address || "",
              city: selectedAddress.city || "",
              state: selectedAddress.state || "",
              postalCode: selectedAddress.postalCode || "",
              mobileNumber: selectedAddress.mobileNumber || "",
            },
            paymentMode: "COD",
            paymentStatus: "Pending",
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            statusHistory: [
              {
                status: "pending",
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        );

        console.log("✅ Order written to Firestore with ID:", orderDocRef.id);
        console.log(
          "✅ All flexible bundle details saved at: orders/" +
            orderDocRef.id +
            "/items",
        );
        toast.success("Order placed successfully!", {
          style: { borderRadius: 0 },
        });
      } catch (firestoreError: any) {
        console.error("❌ Firestore write error:", firestoreError);
        toast.error("Failed to save order to database", {
          style: { borderRadius: 0 },
        });
        throw firestoreError;
      }

      // Store phone and UID in localStorage so guest stays logged in
      if (guestPhoneNumber) {
        localStorage.setItem("guestPhoneNumber", guestPhoneNumber);
        console.log("✅ Guest phone stored for COD order");
      }

      if (finalUserId) {
        localStorage.setItem("guestUID", finalUserId);
        console.log("✅ Guest UID stored for COD order");
      }

      if (userName) {
        localStorage.setItem("guestName", userName);
        console.log("✅ Guest name stored for COD order");
      }

      clearCart();
      sessionStorage.removeItem("directBuyData");

      console.log(
        "✅ [COD ORDER] All tasks complete. Redirecting to success page...",
      );
      setIsPlacingOrder(false);

      // Redirect to order confirmation page (not payment success) using router for auth state persistence
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/success?payment=cod");
    } catch (error) {
      console.error("❌ [COD ORDER] Error placing order:", error);
      setIsPlacingOrder(false);
      toast.error("Failed to place order. Please try again.", {
        style: { borderRadius: 0 },
      });
    }
  };

  return (
    <>
      <Navbar />

      {/* Recaptcha Container */}
      <div
        id="recaptcha-container"
        className="fixed top-0 left-0 opacity-0 pointer-events-none"
      ></div>

      <motion.div
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-24 pb-10">
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
            <button
              onClick={() => setCurrentTab("information")}
              className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === "information" ? "text-black border-b-2 border-black" : "text-gray-400"}`}
              suppressHydrationWarning
            >
              INFORMATION
            </button>
            <button
              onClick={() => {
                if (addresses.length > 0 && selectedAddressIndex !== null) {
                  setCurrentTab("shipping");
                }
              }}
              className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === "shipping" ? "text-black border-b-2 border-black" : addresses.length === 0 || selectedAddressIndex === null ? "text-gray-400 cursor-not-allowed" : "text-gray-400"}`}
              suppressHydrationWarning
            >
              SHIPPING
            </button>
            <button
              onClick={() => {
                if (addresses.length > 0 && selectedAddressIndex !== null) {
                  setCurrentTab("payment");
                }
              }}
              className={`pb-4 font-semibold text-sm tracking-wide transition ${currentTab === "payment" ? "text-black border-b-2 border-black" : addresses.length === 0 || selectedAddressIndex === null ? "text-gray-400 cursor-not-allowed" : "text-gray-400"}`}
              suppressHydrationWarning
            >
              PAYMENT
            </button>
          </motion.div>

          {/* Main Layout */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            suppressHydrationWarning
          >
            {/* LEFT SECTION - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8">
                {currentTab === "information" && (
                  <>
                    {/* Contact Info */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold mb-4">
                        CONTACT INFO
                      </label>

                      {user?.email ? (
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 text-sm mb-3"
                          placeholder="Email"
                        />
                      ) : (
                        <div>
                          {guestPhoneNumber && (
                            <>
                              <input
                                type="tel"
                                value={guestPhoneNumber}
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-600 text-sm mb-3"
                                placeholder="Phone Number"
                              />
                              <button
                                onClick={() => {
                                  setGuestPhoneNumber(null);
                                  setGuestUserId(null);
                                  setIsGuestCheckout(false);
                                }}
                                className="text-blue-600 text-xs font-semibold hover:underline mb-3"
                              >
                                Change Phone Number
                              </button>
                            </>
                          )}

                          <input
                            type="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border text-sm ${formErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.email}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold mb-4">
                        SHIPPING ADDRESS
                      </label>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <input
                            type="text"
                            placeholder="First Name *"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border text-sm ${formErrors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          />
                          {formErrors.firstName && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Last Name *"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border text-sm ${formErrors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          />
                          {formErrors.lastName && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <select
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 border text-sm mb-4 bg-white ${formErrors.country ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        >
                          <option value="">Select Country *</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                        {formErrors.country && (
                          <p className="text-red-500 text-xs mt-1 mb-2">
                            {formErrors.country}
                          </p>
                        )}
                      </div>

                      <div>
                        <select
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className={`w-full px-4 py-3 border text-sm mb-4 bg-white ${formErrors.state ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        >
                          <option value="">Select State / Region *</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        {formErrors.state && (
                          <p className="text-red-500 text-xs mt-1 mb-2">
                            {formErrors.state}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Address *"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 border text-sm mb-4 ${formErrors.address ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        />
                        {formErrors.address && (
                          <p className="text-red-500 text-xs mt-1 mb-2">
                            {formErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <input
                            type="text"
                            placeholder="City *"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            className={`w-full px-4 py-3 border text-sm ${formErrors.city ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Postal Code *"
                            value={formData.postalCode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                postalCode: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border text-sm ${formErrors.postalCode ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          />
                          {formErrors.postalCode && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number * (10 digits)"
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                            if (value.length <= 10) {
                              setFormData({ ...formData, phoneNumber: value });
                            }
                          }}
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className={`w-full px-4 py-3 border text-sm mb-6 ${formErrors.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                        />
                        {formErrors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1 mb-2">
                            {formErrors.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* Shipping Button */}
                      <button
                        onClick={handleMoveToShipping}
                        className="flex items-center gap-2 text-sm font-bold bg-black text-white hover:bg-gray-900 px-6 py-3 transition"
                      >
                        Shipping <span className="ml-2">→</span>
                      </button>
                    </div>
                  </>
                )}

                {currentTab === "shipping" && (
                  <>
                    {/* Display Selected Address */}
                    {selectedAddressIndex !== null &&
                      addresses[selectedAddressIndex] && (
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                          <h3 className="text-sm font-bold mb-2">
                            SHIPPING TO:
                          </h3>
                          <p className="text-sm">
                            {addresses[selectedAddressIndex].firstName}{" "}
                            {addresses[selectedAddressIndex].lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addresses[selectedAddressIndex].address},{" "}
                            {addresses[selectedAddressIndex].city}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addresses[selectedAddressIndex].state},{" "}
                            {addresses[selectedAddressIndex].country} -{" "}
                            {addresses[selectedAddressIndex].postalCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone:{" "}
                            {addresses[selectedAddressIndex].mobileNumber}
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
                          checked={shippingMethod === "standard"}
                          onChange={() => setShippingMethod("standard")}
                          className="w-5 h-5 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="font-semibold block mb-1">
                            Standard Shipping (5-7 days)
                          </span>
                          <span className="text-sm text-gray-600">Free</span>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === "express"}
                          onChange={() => setShippingMethod("express")}
                          className="w-5 h-5 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="font-semibold block mb-1">
                            Express Shipping (2-3 days)
                          </span>
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
                        onClick={() => setCurrentTab("payment")}
                        className="flex items-center gap-2 text-sm font-bold bg-black text-white hover:bg-gray-900 px-6 py-3 transition"
                      >
                        Continue to Payment <span className="ml-2">→</span>
                      </button>
                    </div>
                  </>
                )}

                {currentTab === "payment" && (
                  <>
                    {/* Display Selected Address */}
                    {selectedAddressIndex !== null &&
                      addresses[selectedAddressIndex] && (
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                          <h3 className="text-sm font-bold mb-2">
                            SHIPPING TO:
                          </h3>
                          <p className="text-sm">
                            {addresses[selectedAddressIndex].firstName}{" "}
                            {addresses[selectedAddressIndex].lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addresses[selectedAddressIndex].address},{" "}
                            {addresses[selectedAddressIndex].city}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addresses[selectedAddressIndex].state},{" "}
                            {addresses[selectedAddressIndex].country} -{" "}
                            {addresses[selectedAddressIndex].postalCode}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Phone:{" "}
                            {addresses[selectedAddressIndex].mobileNumber}
                          </p>
                          <p className="text-sm font-semibold">
                            Shipping:{" "}
                            {shippingMethod === "express"
                              ? "Express (2-3 days) - ₹200"
                              : "Standard (5-7 days) - Free"}
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
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="accent-black w-5 h-5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium block mb-1">
                            Cash on Delivery
                          </span>
                          <span className="text-xs text-gray-600">
                            Pay when your order arrives
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 cursor-pointer transition-all hover:border-gray-400">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={() => setPaymentMethod("online")}
                          className="accent-black w-5 h-5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium block mb-1">
                            Pay with UPI & Card
                          </span>
                          <span className="text-xs text-gray-600">
                            UPI, Cards, Net Banking via Razorpay
                          </span>
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
                      {paymentMethod === "online" ? (
                        <button
                          onClick={handlePayment}
                          disabled={isPlacingOrder}
                          className="flex-1 bg-black text-white py-3.5 cursor-pointer hover:bg-gray-900 transition-colors font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlacingOrder
                            ? "Processing..."
                            : `Pay ₹${total.toFixed(2)}`}
                        </button>
                      ) : (
                        <button
                          onClick={handleCODOrder}
                          disabled={isPlacingOrder}
                          className="flex-1 bg-black text-white py-3.5 cursor-pointer hover:bg-gray-900 transition-colors font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPlacingOrder
                            ? "Placing Order..."
                            : `Place Order (₹${total.toFixed(2)})`}
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
                  <span className="text-sm text-gray-600">
                    (
                    {directBuyData && cartItems.length === 0
                      ? directBuyData.quantity || 1
                      : cartCount}
                    )
                  </span>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-100 overflow-y-auto">
                  {directBuyData && cartItems.length === 0 ? (
                    // Display direct buy item
                    <div className="border-b pb-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-20 bg-gray-200 shrink-0 relative">
                          {directBuyData.image && (
                            <Image
                              src={directBuyData.image}
                              alt={directBuyData.productTitle || "Product"}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">
                            {directBuyData.productTitle}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            {directBuyData.size || "One size"}
                          </p>
                          <p className="text-sm font-bold">
                            ₹
                            {(
                              Number(directBuyData.price) *
                              (directBuyData.quantity || 1)
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => (window.location.href = "/products")}
                            className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                          <span className="text-xs">
                            ({directBuyData.quantity || 1})
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Display cart items
                    cartItems.map((it, i) => (
                      <div
                        key={`prod-${(it as any).uniqueKey || i}`}
                        className="border-b pb-4"
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-20 bg-gray-200 shrink-0 relative">
                            {it.image && (
                              <Image
                                src={it.image}
                                alt={it.title || "Product"}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">
                              {it.title}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              {it.size || "One size"}
                            </p>
                            <p className="text-sm font-bold">
                              ₹{((it.price ?? 0) * it.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() =>
                                (window.location.href = "/products")
                              }
                              className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer"
                            >
                              Change
                            </button>
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
                    <span className="font-semibold">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span
                      className={
                        shipping > 0
                          ? "font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {shipping > 0 ? `₹${shipping}` : "Free"}
                    </span>
                  </div>
                  {codCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">COD Charge</span>
                      <span className="font-semibold">₹{codCharge}</span>
                    </div>
                  )}
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
            initialData={
              editingIndex !== null ? addresses[editingIndex] : undefined
            }
          />
        </div>
      </motion.div>
      <Footer />
    </>
  );
}
