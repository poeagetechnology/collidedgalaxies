"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/src/components/admin/adminSidebar";

import { uploadToCloudinary } from "@/src/server/services/cloudinary.service";
import Image from "next/image";

export default function MediaManager() {
  const [announcement, setAnnouncement] = useState("");
  const [savedAnnouncement, setSavedAnnouncement] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");

  const [coupons, setCoupons] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hero images state
  const [heroDesktop, setHeroDesktop] = useState("");
  const [heroMobile, setHeroMobile] = useState("");

  // About Us images state
  const [aboutImages, setAboutImages] = useState<string[]>([]);

  // Firestore refs
  const announcementRef = doc(db, "media", "announcement");
  const couponsCollectionRef = collection(db, "media", "couponData", "coupons");

  const heroImagesRef = doc(db, "media", "heroImages");
  const aboutImagesRef = doc(db, "media", "aboutImages");

  useEffect(() => {
    loadAnnouncement();
    loadCoupons();
    loadHeroImages();
    loadAboutImages();
  }, []);

  const loadAnnouncement = async () => {
    const snap = await getDoc(announcementRef);
    if (snap.exists()) {
      const text = snap.data().text || "";
      setAnnouncement(text);
      setSavedAnnouncement(text);
    }
  };

  const loadCoupons = async () => {
    const snap = await getDocs(couponsCollectionRef);
    const list: any[] = [];
    snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
    setCoupons(list);
  };

  const saveAnnouncement = async () => {
    const trimmed = announcement.trim();
    await setDoc(announcementRef, {
      text: trimmed,
      updatedAt: serverTimestamp(),
    });
    setSavedAnnouncement(trimmed);
    window.dispatchEvent(new Event("announcement-updated"));
  };

  const clearAnnouncement = async () => {
    await deleteDoc(announcementRef);
    setAnnouncement("");
    setSavedAnnouncement("");
    window.dispatchEvent(new Event("announcement-updated"));
  };

  const saveCoupon = async () => {
    if (!couponCode.trim() || !couponDiscount) return;

    await addDoc(couponsCollectionRef, {
      code: couponCode.trim(),
      discount: Number(couponDiscount),
      updatedAt: serverTimestamp(),
    });

    setCouponCode("");
    setCouponDiscount("");

    await loadCoupons();
    window.dispatchEvent(new Event("coupon-updated"));
  };

  const deleteCoupon = async (id: string) => {
    await deleteDoc(doc(db, "media", "couponData", "coupons", id));
    await loadCoupons();
    window.dispatchEvent(new Event("coupon-updated"));
  };

  const loadHeroImages = async () => {
    const snap = await getDoc(heroImagesRef);
    if (snap.exists()) {
      const data = snap.data();
      setHeroDesktop(data.desktop || "");
      setHeroMobile(data.mobile || "");
    }
  };

  const loadAboutImages = async () => {
    const snap = await getDoc(aboutImagesRef);
    if (snap.exists()) {
      const data = snap.data();
      setAboutImages(data.images || []);
    }
  };

  // Hero Upload (no change)
  // Upload hero image (desktop or mobile) to Cloudinary
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Cloudinary (in folder hero/desktop or hero/mobile)
      const folderName = type === "desktop" ? "hero-desktop" : "hero-mobile";
      const imageUrl = await uploadToCloudinary(file, folderName);

      // Update Firestore with URL only
      await setDoc(
        heroImagesRef,
        {
          [type]: imageUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (type === "desktop") setHeroDesktop(imageUrl);
      else setHeroMobile(imageUrl);

      window.dispatchEvent(new Event("hero-updated"));
    } catch (error) {
      console.error("Error uploading hero image:", error);
      alert("Failed to upload hero image!");
    }
  };

  const deleteHeroImage = async (type: "desktop" | "mobile") => {
    await setDoc(
      heroImagesRef,
      {
        [type]: "",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (type === "desktop") setHeroDesktop("");
    else setHeroMobile("");

    window.dispatchEvent(new Event("hero-updated"));
  };


  // ⭐ FINAL: ABOUT US UPLOAD USING CLOUDINARY ⭐
  const handleSingleAboutUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToCloudinary(file, "about-us");

      const updated = [...aboutImages];
      updated[index] = imageUrl;

      await setDoc(aboutImagesRef, {
        images: updated,
        updatedAt: serverTimestamp(),
      });

      setAboutImages(updated);
      window.dispatchEvent(new Event("about-images-updated"));
    } catch (error) {
      console.error("Error uploading About Us image:", error);
      alert("Image upload failed!");
    }
  };

  const deleteAboutImage = async (index: number) => {
    const updated = [...aboutImages];
    updated[index] = "";

    await setDoc(aboutImagesRef, {
      images: updated,
      updatedAt: serverTimestamp(),
    });

    setAboutImages(updated);
    window.dispatchEvent(new Event("about-images-updated"));
  };

  return (
    <>
      {/* Sidebar + Rest UI (unchanged) */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 w-58 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 text-gray-800 hover:text-gray-800 z-50 p-1 hover:bg-gray-200 transition-colors"
        >
          <X size={28} />
        </button>
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div>
        <div className="lg:hidden bg-white drop-shadow-sm px-4 py-3 flex items-center sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-4 h-screen sm:pt-6 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">Media Manager</h1>
          </div>

          {/* Announcement Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Site Announcement</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add a short announcement to display at the top of the home page.
            </p>

            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="E.g. Holiday Sale: Up to 40% off this week!"
              rows={3}
              className="w-full border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black resize-none"
            />

            {savedAnnouncement && (
              <span className="text-xs sm:text-sm text-gray-600 truncate block mt-1">
                Current: {savedAnnouncement}
              </span>
            )}

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <button
                onClick={saveAnnouncement}
                disabled={announcement.trim() === savedAnnouncement.trim()}
                className="bg-black cursor-pointer hover:bg-gray-700 text-white px-4 py-2 text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Announcement
              </button>

              <button
                onClick={clearAnnouncement}
                disabled={!savedAnnouncement}
                className="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-4 py-2 text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="py-2">
            <h2 className="text-lg font-semibold mb-3">Coupon Codes</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add multiple coupon codes with discount percentages.
            </p>

            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full border border-black px-3 py-2 text-sm sm:text-base mb-3 focus:outline-none focus:ring-1 focus:ring-black"
            />

            <input
              type="number"
              value={couponDiscount}
              onChange={(e) => setCouponDiscount(e.target.value)}
              placeholder="Discount % (e.g. 20)"
              className="w-full border border-black px-3 py-2 text-sm sm:text-base mb-1 focus:outline-none focus:ring-1 focus:ring-black"
            />

            <button
              onClick={saveCoupon}
              disabled={!couponCode.trim() || !couponDiscount}
              className="bg-black cursor-pointer hover:bg-gray-700 text-white px-4 py-2 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-4"
            >
              Add Coupon
            </button>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Saved Coupons</h3>

              {coupons.length === 0 ? (
                <p className="text-sm text-gray-500">No coupons added yet.</p>
              ) : (
                coupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border p-3 mt-2"
                  >
                    <div>
                      <p className="font-medium">{c.code}</p>
                      <p className="text-sm text-gray-600">{c.discount}% off</p>
                    </div>

                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-2 sm:px-3 py-1 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hero Images Section */}
          <div className="mb-8 border-t pt-8">
            <h2 className="text-lg font-semibold mb-3">Hero Images</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload hero banner images for desktop and mobile.
            </p>

            {/* Desktop Hero */}
            <div className="mb-6">
              <label className="block font-medium mb-2">Desktop Hero</label>
              {heroDesktop && (
                <div className="mb-3 relative inline-block">
                  <Image
                    src={heroDesktop}
                    alt="Desktop Hero"
                    width={1000}
                    height={1000}
                    className="w-full max-w-md h-32 object-cover border"
                  />
                  <button
                    onClick={() => deleteHeroImage("desktop")}
                    className="absolute -top-2 -right-2 cursor-pointer bg-red-600 text-white w-6 h-6 flex items-center justify-center hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload Desktop Hero</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImageUpload(e, "desktop")}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended: 1920x600px</p>
              </div>
            </div>

            {/* Mobile Hero */}
            <div className="mb-6">
              <label className="block font-medium mb-2">Mobile Hero</label>
              {heroMobile && (
                <div className="mb-3 relative inline-block">
                  <Image
                    src={heroMobile}
                    alt="Mobile Hero"
                    width={1000}
                    height={1000}
                    className="w-full max-w-xs h-32 object-cover border"
                  />
                  <button
                    onClick={() => deleteHeroImage("mobile")}
                    className="absolute -top-2 -right-2 cursor-pointer bg-red-600 text-white w-6 h-6 flex items-center justify-center hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload Mobile Hero</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImageUpload(e, "mobile")}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended: 768x400px</p>
              </div>
            </div>
          </div>

          {/* About Us Images Section */}
          <div className="mb-8 border-t py-8">
            <h2 className="text-lg font-semibold mb-3">About Us Images</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload 4 separate images for the About Us section.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx}>
                  <label className="block font-medium mb-2">Image {idx + 1}</label>

                  {aboutImages[idx] && (
                    <div className="mb-3 relative inline-block">
                      <Image
                        src={aboutImages[idx]}
                        alt={`About ${idx + 1}`}
                        width={1000}
                        height={1000}
                        className="w-full h-32 object-cover border"
                      />
                      <button
                        onClick={() => deleteAboutImage(idx)}
                        className="absolute -top-2 -right-2 cursor-pointer bg-red-600 text-white w-6 h-6 flex items-center justify-center hover:bg-red-700 transition"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                    <label
                      htmlFor={`about_upload_${idx}`}
                      className="cursor-pointer font-medium text-black hover:text-gray-700"
                    >
                      {aboutImages[idx] ? "Replace Image" : "Upload Image"}
                    </label>

                    <input
                      id={`about_upload_${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSingleAboutUpload(e, idx)}
                    />

                    <p className="text-xs text-gray-500 mt-1">PNG/JPG up to 10MB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    </>
  );
}
