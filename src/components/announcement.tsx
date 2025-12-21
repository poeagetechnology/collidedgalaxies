'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  const [text, setText] = useState('');

  useEffect(() => {
    const announcementRef = doc(db, "media", "announcement");

    const unsub = onSnapshot(announcementRef, (snap) => {
      if (snap.exists()) {
        setText(snap.data().text || '');
      } else {
        setText('');
      }
    });

    return () => unsub();
  }, []);

  if (!text) return null;

  return (
    <motion.div 
      className="w-full bg-[#1c1c1c] text-white text-xs md:text-sm py-2 items-center justify-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className='max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 cursor-pointer hover:underline'>
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Link href={"/products"} className="font-semibold tracking-wide truncate max-w-[85%]">{text}</Link>
        </motion.div>
      </div>
    </motion.div>
  );
}