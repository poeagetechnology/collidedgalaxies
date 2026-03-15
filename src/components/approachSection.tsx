'use client';
import { motion } from 'framer-motion';

export default function ApproachSection() {
  return (
    <motion.section 
      className="w-full bg-white py-16 md:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, margin: "-50px" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center space-y-6 border-l-4 border-black pl-8"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-50px" }}
        >
          {/* Title */}
          <motion.h2 
            className="text-4xl md:text-5xl font-bold leading-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            OUR APPROACH TO
            <br />
            FASHION DESIGN
          </motion.h2>

          {/* Description */}
          <motion.p 
            className="text-base md:text-lg text-gray-700 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            at elegant vogue, we blend creativity with craftsmanship to create fashion that transcends trends and stands the test of time each design is meticulously crafted, ensuring the highest quality exquisite finish
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}
