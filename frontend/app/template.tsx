'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
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
