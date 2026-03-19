"use client";

import { motion } from "framer-motion";
import Navbar from "../../src/components/header";
import OfferScroller from "../../src/components/offerScroller";
// DISABLED: Bundle popup import
// import BundleOfferPopup from "../../src/components/bundleOfferPopup";
import HeroSection from "../../src/components/hero";
import NewThisWeek from "../../src/components/newthisweek";
import Plains from "../../src/components/plains";
// DISABLED: Bundle section import
// import BundleSection from "../../src/components/bundles/bundleSection";
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
      <OfferScroller />
      {/* DISABLED: Bundle popup */}
      {/* <BundleOfferPopup /> */}
      <HeroSection />
      {/* DISABLED: Bundle section */}
      {/* <BundleSection limit={3} /> */}
      <NewThisWeek />
      <Plains />
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
