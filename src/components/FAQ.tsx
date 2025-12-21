"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Albert_Sans } from "next/font/google";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const faqs = [
  {
    question:
      "What are your shipping options, costs, and delivery times?",
    answer:
      `We offer standard domestic shipping across India. Orders are processed within 1–2 business days and delivered within 3–7 business days depending on your location.\n\nShipping Charges:\n• Standard shipping rates apply and will be shown at checkout\n• Free shipping may be available during select launches or offers\n\nTracking:\n• Once dispatched, you will receive a tracking link via SMS, Email, or WhatsApp\n• You can track your order through the courier’s website or the Shiprocket portal\n\nDelivery Timeline:\n• 1–2 business days for processing\n• 3–7 business days for delivery (location dependent)`,
  },
  {
    question:
      "What is your return and exchange policy, including steps for starting a return?",
    answer:
      `We accept returns and exchanges within 7 days from the date of delivery for eligible cases.\n\nEligible reasons:\n• Damaged or defective items\n• Incorrect product delivered\n• Wrong size delivered (as per size chart)\n\nConditions:\n• Item must be unused, unwashed & in original condition\n• All tags and packaging must be intact\n• An unboxing video is mandatory if the parcel arrives damaged, opened, or tampered\n\nProcess:\n1. Contact us via Instagram, WhatsApp, or Email within 7 days of delivery\n2. Share your Order ID along with clear photos/videos of the issue\n3. Our team will verify the request\n4. A pickup will be arranged through our courier partner\n5. After quality checking, your exchange or refund will be processed\n\nShipping Charges:\n• If the issue is from our side → Free pickup + full refund/exchange\n• If the customer requests exchange for personal reasons → Return shipping charges may apply`,
  },
  {
    question: "Do you have a size guide or fit recommendations?",
    answer:
      "Yes! We provide a detailed size chart for all products to help you find your perfect fit.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept all major debit/credit cards, UPI apps (Google Pay, PhonePe, Paytm), and net banking. All payments are securely processed through Razorpay.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className={`relative w-full bg-white py-12 z-10 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center w-full pb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-50px" }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl text-center md:text-left md:w-[300px] font-semibold leading-tight mb-2 md:mb-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            Find answers to the most common questions about our clothing brand.
          </motion.p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div 
          className="divide-y divide-black"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div key={index} className="py-4" variants={itemVariants}>
              <motion.button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left gap-4 focus:outline-none"
                whileHover={{ x: 5 }}
              >
                <span className="text-xl font-medium text-gray-900">
                  {faq.question}
                </span>

                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === index ? (
                    <Image
                      src="/MinusCircle.svg"
                      alt="Minus"
                      width={24}
                      height={24}
                      className="cursor-pointer shrink-0"
                    />
                  ) : (
                    <Image
                      src="/PlusCircle.svg"
                      alt="Plus"
                      width={24}
                      height={24}
                      className="cursor-pointer shrink-0"
                    />
                  )}
                </motion.div>
              </motion.button>

              {/* Smooth expand/collapse with Framer Motion */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: openIndex === index ? 1 : 0, 
                  height: openIndex === index ? 'auto' : 0 
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <motion.p 
                  className="text-gray-600 text-lg whitespace-pre-line leading-relaxed mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: openIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {faq.answer}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
