'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  ScaleIn,
  BounceIn,
  RotateIn,
  FlipInX,
  HoverLift,
  FloatingElement,
  BlurIn,
  GlowEffect,
  MorphShape,
} from '@/src/components/AnimatedComponents';
import {
  AnimatedButton,
  AnimatedHeading,
  AnimatedGradientText,
} from '@/src/components/AnimatedSections';

/**
 * Animation Showcase Component
 * Displays all available animations in a beautiful demo
 * 
 * Usage:
 * import { AnimationShowcase } from '@/src/components/AnimationShowcase';
 * 
 * <AnimationShowcase />
 */
export function AnimationShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Animation Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Explore all the beautiful animations available in your system
          </p>
        </motion.div>

        {/* Entrance Animations */}
        <motion.section className="mb-20">
          <AnimatedHeading level="h2" className="text-3xl font-bold mb-8">
            Entrance Animations
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <FadeIn duration={1}>
                <div className="h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Fade In</span>
                </div>
              </FadeIn>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <SlideInLeft duration={1}>
                <div className="h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Slide Left</span>
                </div>
              </SlideInLeft>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <SlideInRight duration={1}>
                <div className="h-24 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Slide Right</span>
                </div>
              </SlideInRight>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <ScaleIn duration={1}>
                <div className="h-24 bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Scale In</span>
                </div>
              </ScaleIn>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <BounceIn duration={1}>
                <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Bounce In</span>
                </div>
              </BounceIn>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <RotateIn duration={1}>
                <div className="h-24 bg-gradient-to-r from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Rotate In</span>
                </div>
              </RotateIn>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <FlipInX duration={1}>
                <div className="h-24 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Flip In X</span>
                </div>
              </FlipInX>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <BlurIn duration={1}>
                <div className="h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">Blur In</span>
                </div>
              </BlurIn>
            </div>
          </div>
        </motion.section>

        {/* Motion Effects */}
        <motion.section className="mb-20">
          <AnimatedHeading level="h2" className="text-3xl font-bold mb-8">
            Motion Effects
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <FloatingElement duration={3} className="h-24 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Floating</span>
              </FloatingElement>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <GlowEffect className="h-24 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Glow Effect</span>
              </GlowEffect>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <MorphShape className="h-24 bg-gradient-to-r from-rose-400 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Morph Shape</span>
              </MorphShape>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <motion.div
                className="h-24 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg flex items-center justify-center animate-bounce-subtle"
              >
                <span className="text-white font-semibold">Bounce Subtle</span>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Hover Effects */}
        <motion.section className="mb-20">
          <AnimatedHeading level="h2" className="text-3xl font-bold mb-8">
            Hover Effects
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HoverLift className="bg-white rounded-lg p-6 shadow-lg cursor-pointer">
              <div className="h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Hover Lift</span>
              </div>
            </HoverLift>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-24 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Hover Scale</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg cursor-pointer"
              whileHover={{ rotate: 5, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-24 bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Hover Rotate</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg cursor-pointer"
              whileHover={{ y: -5, boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold">Hover Shadow</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Text Animations */}
        <motion.section className="mb-20">
          <AnimatedHeading level="h2" className="text-3xl font-bold mb-8">
            Text Animations
          </AnimatedHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <AnimatedGradientText className="text-3xl font-bold">
                Gradient Text
              </AnimatedGradientText>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <motion.div
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 animate-text-glow"
              >
                Text Glow
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Button Animations */}
        <motion.section className="mb-20">
          <AnimatedHeading level="h2" className="text-3xl font-bold mb-8">
            Interactive Buttons
          </AnimatedHeading>

          <div className="flex flex-wrap gap-4">
            <AnimatedButton variant="primary">Primary Button</AnimatedButton>
            <AnimatedButton variant="secondary">Secondary Button</AnimatedButton>
            <AnimatedButton variant="outline">Outline Button</AnimatedButton>
          </div>
        </motion.section>

        {/* CSS Class Animations */}
        <motion.section className="mb-20">
          <AnimatedHeading level="h2" className="text-3xl font-bold mb-8">
            CSS Class Animations
          </AnimatedHeading>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'animate-fade-in',
              'animate-slide-in-left',
              'animate-slide-in-right',
              'animate-scale-in',
              'animate-bounce-in',
              'animate-rotate-in',
              'animate-flip-in-x',
              'animate-pulse-glow',
              'animate-float',
              'animate-morph',
              'animate-shimmer',
              'hover-lift',
            ].map((animClass, index) => (
              <motion.div
                key={animClass}
                className={`bg-white rounded-lg p-4 shadow-lg text-center ${animClass}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <code className="text-xs text-gray-600">{animClass}</code>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to use these animations?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Check the ANIMATION_GUIDE.md for implementation details
          </p>
          <AnimatedButton variant="primary">Get Started</AnimatedButton>
        </motion.div>
      </div>
    </div>
  );
}
