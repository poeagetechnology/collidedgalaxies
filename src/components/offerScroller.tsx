'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function OfferScroller() {
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

  // Duplicate text many times to ensure continuous scrolling
  const scrollText = Array(20).fill(`${text} ★`).join(' ');

  return (
    <div className="w-full bg-black text-white py-2 overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .offer-scroller-wrapper {
          display: flex;
          width: 100%;
          overflow: hidden;
        }
        .offer-scroller {
          animation: scroll 40s linear infinite;
          white-space: nowrap;
          display: flex;
          gap: 20px;
          padding-right: 20px;
        }
        .offer-scroller:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="offer-scroller-wrapper">
        <div className="offer-scroller text-center text-sm md:text-base font-normal tracking-wide">
          {scrollText}
        </div>
      </div>
    </div>
  );
}
