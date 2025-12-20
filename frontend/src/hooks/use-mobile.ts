"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect mobile screen size (< 768px)
 * Returns boolean indicating if screen is mobile-sized
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Adjust breakpoint as needed
    }

    // Set initial value
    handleResize()

    // Listen for window resize events
    window.addEventListener("resize", handleResize)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}

// Alias for compatibility
export const useIsMobile = useMobile;
