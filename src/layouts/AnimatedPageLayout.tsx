'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps page content with smooth entrance animations
 * Apply to all page layouts for consistent page transitions
 */
export function AnimatedPageLayout({
  children,
  className = '',
}: AnimatedPageLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Higher-order component to add animations to layout wrappers
 */
export function withAnimatedLayout<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AnimatedLayoutComponent(props: P) {
    return (
      <AnimatedPageLayout>
        <Component {...props} />
      </AnimatedPageLayout>
    );
  };
}
