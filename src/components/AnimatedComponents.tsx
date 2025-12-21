'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { containerVariants, itemVariants } from '@/src/utils/animations';

// Page wrapper with transition animation
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

// Stagger container for multiple children
interface StaggerContainerProps {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  delay = 0.2,
  stagger = 0.1,
  className = '',
}: StaggerContainerProps) {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in component
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration, delay }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from left
interface SlideInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideInLeft({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from right
export function SlideInRight({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation
export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Bounce in animation
export function BounceIn({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.68, -0.55, 0.265, 1.55],
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate in animation
export function RotateIn({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -180, scale: 0 }}
      whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.68, -0.55, 0.265, 1.55],
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Flip in X animation
export function FlipInX({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 90 }}
      whileInView={{ opacity: 1, rotateX: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.68, -0.55, 0.265, 1.55],
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// Hover lift effect
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
}

export function HoverLift({ children, className = '' }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating animation
export function FloatingElement({
  children,
  duration = 3,
  className = '',
}: {
  children: ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [-20, 20, -20] }}
      transition={{
        duration,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Blur in animation
export function BlurIn({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: SlideInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration, delay }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated stagger list item
export function AnimatedListItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.li
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.li>
  );
}

// Text reveal animation
export function TextReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Number counter animation
export function CountUp({
  from = 0,
  to,
  duration = 2,
  className = '',
  suffix = '',
}: {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const increment = (to - from) / (duration * 60);
    const interval = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        return next >= to ? to : next;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return (
    <span className={className}>
      {Math.floor(count)}
      {suffix}
    </span>
  );
}

// Glow effect
export function GlowEffect({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 20px rgba(59, 130, 246, 0.3)',
          '0 0 40px rgba(59, 130, 246, 0.6)',
          '0 0 20px rgba(59, 130, 246, 0.3)',
        ],
      }}
      transition={{
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Morph animation
export function MorphShape({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
      }}
      transition={{
        duration: 4,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
