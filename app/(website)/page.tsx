'use client';

import { motion } from 'framer-motion';
import Navbar from "../../src/components/header";
import HeroSection from "../../src/components/hero";
import NewThisWeek from "../../src/components/newthisweek";
import ApproachSection from "../../src/components/approachSection";
import QuoteSection from "../../src/components/saying";
import CollectionsSection from "../../src/components/collections";
import TestimonialsSection from "../../src/components/testimonials";
import FeaturesBar from "../../src/components/feature";
import Footer from "../../src/components/footer";
import FAQ from "../../src/components/FAQ";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      <Navbar />
      <HeroSection />
      <NewThisWeek />
      <ApproachSection />
      <QuoteSection />
      <CollectionsSection />
      <TestimonialsSection />
      <FAQ />
      <FeaturesBar />
      <Footer />
    </motion.div>
  );
}

