'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Define spatial direction based on route (Register is 'right', Login/Home is 'left')
  const isRightSide = pathname.includes('/register')

  const variants = {
    initial: { 
      opacity: 0, 
      x: isRightSide ? 50 : -50, 
      filter: 'blur(8px)' 
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      filter: 'blur(0px)' 
    },
    exit: { 
      opacity: 0, 
      x: isRightSide ? -50 : 50, 
      filter: 'blur(8px)' 
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30, 
          mass: 0.8,
          duration: 0.3 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
