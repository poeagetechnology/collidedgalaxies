/**
 * Animation utilities and configurations using Framer Motion
 */

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
    },
  },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const slideInFromLeftVariants = {
  hidden: {
    opacity: 0,
    x: -100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const slideInFromRightVariants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const scaleInVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,

    },
  },
};

export const rotateInVariants = {
  hidden: {
    opacity: 0,
    rotate: -180,
    scale: 0,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
};

export const flipInXVariants = {
  hidden: {
    opacity: 0,
    rotateX: 90,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const flipInYVariants = {
  hidden: {
    opacity: 0,
    rotateY: 90,
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const bounceInVariants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
};

export const hoverVariants = {
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
    },
  },
};

export const tapVariants = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

export const floatingVariants = {
  animate: {
    y: [-20, 20, -20],
    transition: {
      duration: 4,
      repeat: Infinity,
    },
  },
};

export const floatingSlowVariants = {
  animate: {
    y: [-15, 15, -15],
    transition: {
      duration: 5,
      repeat: Infinity,
    },
  },
};

export const pulseGlowVariants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.5)',
      '0 0 40px rgba(59, 130, 246, 0.8)',
      '0 0 20px rgba(59, 130, 246, 0.5)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const morphVariants = {
  animate: {
    borderRadius: [
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '30% 60% 70% 40% / 50% 60% 30% 60%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
    },
  },
};

export const textGlowVariants = {
  animate: {
    textShadow: [
      '0 0 10px rgba(251, 146, 60, 0.5)',
      '0 0 20px rgba(251, 146, 60, 1), 0 0 30px rgba(251, 146, 60, 0.7)',
      '0 0 10px rgba(251, 146, 60, 0.5)',
    ],
    transition: {
      duration: 2,

      repeat: Infinity,
    },
  },
};

export const gradientShiftVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 8,
      repeat: Infinity,
    },
  },
};

export const shimmerVariants = {
  animate: {
    backgroundPosition: ['-1000px 0', '1000px 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const blurInVariants = {
  hidden: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const expandVariants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const breadcrumbVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
    },
  }),
};

export const buttonHoverVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
    },
  },
  tap: {
    scale: 0.95,
  },
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.3,
    },
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};
