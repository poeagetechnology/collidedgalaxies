'use client';

import React, { ReactNode } from 'react';
import { motion, cubicBezier } from 'framer-motion';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

/**
 * Animated section with staggered children
 * Use this to wrap major sections for coordinated animations
 */
export function AnimatedSection({
  children,
  className = '',
  stagger = 0.1,
  delay = 0,
}: AnimatedSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: cubicBezier(0.25, 0.46, 0.45, 0.94) },
    },
  };

  return (
    <motion.section
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: '-50px' }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.section>
  );
}

/**
 * Product card animation wrapper
 */
interface AnimatedProductCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedProductCard({
  children,
  index = 0,
  className = '',
}: AnimatedProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: index * 0.1,
          ease: cubicBezier(0.34, 1.56, 0.64, 1),
        },
      }}
      whileHover={{
        y: -10,
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.97 }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated list item with stagger
 */
interface AnimatedListItemProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedListItem({
  children,
  index = 0,
  className = '',
}: AnimatedListItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.5,
          delay: index * 0.08,
        },
      }}
      viewport={{ once: false, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.li>
  );
}

/**
 * Animated heading with text reveal
 */
interface AnimatedHeadingProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  level?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function AnimatedHeading({
  children,
  className = '',
  delay = 0,
  level = 'h2',
}: AnimatedHeadingProps) {
  const Component = level;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          delay,
          ease: cubicBezier(0.34, 1.56, 0.64, 1),
        },
      }}
      viewport={{ once: false, margin: '-50px' }}
    >
      <Component className={className}>{children}</Component>
    </motion.div>
  );
}

/**
 * Animated button with ripple effect
 */
interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function AnimatedButton({
  children,
  className = '',
  variant = 'primary',
  onClick,
  ...rest
}: AnimatedButtonProps) {
  const baseClasses =
    'relative overflow-hidden px-6 py-2 rounded-lg font-semibold';

  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50',
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileTap={{ opacity: 0.2 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.button>
  );
}

/**
 * Animated counter for statistics
 */
interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  delay?: number;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2.5,
  suffix = '',
  prefix = '',
  className = '',
  delay = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const increment = (to - from) / (duration * 100);
    let currentValue = from;

    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(currentValue));
      }
    }, 1000 / 100);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.6,
          delay,
          ease: cubicBezier(0.34, 1.56, 0.64, 1),
        },
      }}
      viewport={{ once: false, margin: '-50px' }}
    >
      {prefix}
      {count}
      {suffix}
    </motion.div>
  );
}

/**
 * Animated image with parallax effect on scroll
 */
interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  parallax?: boolean;
}

export function AnimatedImage({
  src,
  alt,
  className = '',
  parallax = false,
}: AnimatedImageProps) {
  const [offsetY, setOffsetY] = React.useState(0);

  React.useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      setOffsetY(window.scrollY * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, margin: '-50px' }}
      style={parallax ? { y: offsetY } : {}}
      className={className}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  );
}

/**
 * Animated gradient text
 */
interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
}

export function AnimatedGradientText({
  children,
  className = '',
  colors = ['from-purple-600', 'via-pink-600', 'to-red-600'],
}: AnimatedGradientTextProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r ${colors.join(
        ' '
      )} bg-clip-text text-transparent ${className}`}
      animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated tab component
 */
interface AnimatedTabProps {
  tabs: { label: string; content: ReactNode }[];
  defaultTab?: number;
}

export function AnimatedTabs({ tabs, defaultTab = 0 }: AnimatedTabProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <motion.div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === index
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            whileHover={{ backgroundColor: '#f9f9f9' }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.label}
            {activeTab === index && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="py-6"
      >
        {tabs[activeTab].content}
      </motion.div>
    </div>
  );
}

/**
 * Scroll progress indicator
 */
export function ScrollProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 z-50"
      style={{ scaleX: progress / 100 }}
      transformTemplate={({ scaleX }) => `scaleX(${scaleX})`}
    />
  );
}
