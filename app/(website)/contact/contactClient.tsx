"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Albert_Sans } from "next/font/google";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const WEB3FORMS_ACCESS_KEY = "eb417a88-283b-484e-868d-b819a6e2a485";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        setError(
          `${key.charAt(0).toUpperCase() + key.slice(1)} cannot be empty.`
        );
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const response = await axios.post("https://api.web3forms.com/submit", {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phoneNumber,
        message: formData.message,
        subject: "New Contact Form Submission",
        redirect: "",
        botcheck: "",
      });

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          message: "",
        });
      } else {
        setError("Form submission failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while submitting the form.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <section
        id="contact"
        className={`min-h-screen bg-white ${albertSans.className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 pb-10 md:pt-30 md:pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center w-full pb-10">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-2 md:mb-0">
              Contact Us
            </h1>
            <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
              We&apos;d love to hear from you. Get in touch with any questions or
              feedback.
            </p>
          </div>

          <div className="w-full flex flex-col justify-between md:flex-row gap-12 md:gap-14 py-12 items-center">
            {/* Form Column */}
            <div className="p-6 shadow-lg border-1 border-gray-200 rounded-none w-full max-w-none lg:max-w-[600px]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <input type="text" name="botcheck" style={{ display: "none" }} />

                {/* First + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      First Name <span className="text-[#FF5107]">*</span>
                    </label>
                    <input
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-black rounded-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Last Name <span className="text-[#FF5107]">*</span>
                    </label>
                    <input
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-black rounded-none bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Email <span className="text-[#FF5107]">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-black rounded-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Phone Number <span className="text-[#FF5107]">*</span>
                    </label>
                    <input
                      name="phoneNumber"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-black rounded-none bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Message <span className="text-[#FF5107]">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Enter your message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-black rounded-none bg-white"
                    required
                  />
                </div>

                {error && <p className="text-red-600">{error}</p>}
                {success && (
                  <p className="text-green-600">Form submitted successfully!</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center bg-black text-white cursor-pointer px-6 py-3 gap-4 rounded-none hover:bg-gray-800 transition group"
                >
                  {loading ? "Submitting..." : "Send Message"}
                  {!loading && (
                    <Image
                      src="/arrowIcon.svg"
                      alt="arrow"
                      width={24}
                      height={24}
                      className="w-6 h-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                    />
                  )}
                </button>
              </form>
            </div>

            {/* Info Column */}
            <div className="flex-[2] max-w-[450px] w-full space-y-16 p-6 items-center">
              {/* Email */}
              <div className="flex items-start gap-8">
                <div className="bg-[#1A1A1A] rounded-xl p-3 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src="/mailIcon.svg"
                    alt="Email"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-black text-xl mb-2">Email</h2>
                  <p>collidedgalaxies.info@gmail.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-8">
                <div className="bg-[#1A1A1A] rounded-xl p-3 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src="/phoneIcon.svg"
                    alt="Phone"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-black text-xl mb-2">Phone</h2>
                  <p>+91 90258 65018</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-8">
                <div className="bg-[#1A1A1A] rounded-xl p-3 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src="/locationIcon.svg"
                    alt="Address"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-black text-xl mb-2">Address</h2>
                  <p>
                    2/224 Maruthinagar, Zuzuvadi,
                    Hosur, Tamil Nadu 635109
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}