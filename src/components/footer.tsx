// Footer with animations
'use client';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Footer() {
  return (
    <footer className="relative bg-black text-white pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12 z-10">
      {/* ✅ Container */}
      <motion.div 
        className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between md:items-start gap-8 sm:gap-12 md:gap-20 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-50px" }}
      >

        {/* ✅ Left: Logo & Slogan */}
        <motion.div className="flex flex-col gap-3 sm:gap-4 md:gap-5 md:w-1/3 text-left" variants={itemVariants}>
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-[3rem] tracking-wide leading-none"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            COGA
          </motion.h2>
          <motion.p 
            className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            Collided Galaxies — Style that speaks louder than words.
          </motion.p>

          {/* Socials */}

          <motion.div 
            className="flex justify-start space-x-8 mt-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Link href="https://www.instagram.com/coga.in/" target="_blank" aria-label="Instagram" className="hover:opacity-80 transition">
                <Image
                  src="/instaIcon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-8 h-8"
                />
              </Link>
            </motion.div>
            {/* Commented out X and LinkedIn icons
            <Link href="#" aria-label="X" className="hover:opacity-80 transition">
              <Image
                src="/xIcon.svg"
                alt="X"
                width={24}
                height={24}
                className="w-8 h-8"
              />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="hover:opacity-80 transition">
              <Image
                src="/linkedinIcon.svg"
                alt="LinkedIn"
                width={24}
                height={24}
                className="w-8 h-8"
              />
            </Link>
            */}
          </motion.div>

        </motion.div>

        {/* ✅ Right: 3 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:w-2/3 text-left">

          {/* Column 1: Information */}
          <div>
            <h3 className="font-semibold mb-3 text-xl">Information</h3>
            <ul className="space-y-2 text-md text-gray-300">
              <li><Link href="/policies/shipping" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link href="/policies/return-and-refund" className="hover:text-white transition">Return & Refund Policy</Link></li>

            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="md:pl-6">
            <h3 className="font-semibold mb-3 text-xl">Company</h3>
            <ul className="space-y-2 text-md text-gray-300">
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-xl">Contact</h3>
            <ul className="space-y-2 text-md text-gray-300 leading-relaxed">
              <li>
                2/224 Maruthinagar, Zuzuvadi,<br />Hosur, Tamil Nadu 635109
              </li>
              <li>+91 90258 65018</li>
              <li>collidedgalaxies.info@gmail.com</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <hr className="border-gray-800 my-10" />

      {/* ✅ Bottom note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-500 text-center">
        <div>
          <ul className="text-center flex justify-center gap-2 mb-2">
            <li><Link href="/policies/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li>|</li>
            <li><Link href="/policies/terms-and-conditions" className="hover:text-white transition">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          © 2025 Collided Galaxies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
