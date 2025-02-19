import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AuthCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function AuthCard({ title, children, className }: AuthCardProps) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 768px)").matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const variants = {
    initial: { [isMobile ? 'y' : 'x']: 50, opacity: 0 },
    animate: { [isMobile ? 'y' : 'x']: 0, opacity: 1 },
    exit: { [isMobile ? 'y' : 'x']: 50, opacity: 0 }
  }

  return (
    <div className="grid place-items-center p-4 ">
      <motion.div 
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="bg-primary/5 rounded-2xl p-5 w-full max-w-md shadow-xs"
      >
        <h2 className="text-xl font-bold text-foreground mb-5">{title}</h2>
        {children}
      </motion.div>
    </div>
  )
} 