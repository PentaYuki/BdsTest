'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'

type PriorityContextType = {
  currentPriority: number
  registerPriority: (priority: number) => void
}

const PriorityContext = createContext<PriorityContextType | undefined>(undefined)

export function PriorityProvider({ children }: { children: React.ReactNode }) {
  const [currentPriority, setCurrentPriority] = useState(1)
  const [maxPriority, setMaxPriority] = useState(1)

  const registerPriority = (priority: number) => {
    setMaxPriority(prev => Math.max(prev, priority))
  }

  useEffect(() => {
    if (currentPriority < maxPriority) {
      const timer = setTimeout(() => {
        setCurrentPriority(prev => prev + 1)
      }, 400 * currentPriority) // Increment priority every 400ms * current level
      return () => clearTimeout(timer)
    }
  }, [currentPriority, maxPriority])

  return (
    <PriorityContext.Provider value={{ currentPriority, registerPriority }}>
      {children}
    </PriorityContext.Provider>
  )
}

interface PriorityLoaderProps {
  priority: number
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PriorityLoader({ priority, children, fallback }: PriorityLoaderProps) {
  const context = useContext(PriorityContext)
  
  useEffect(() => {
    if (context) {
      context.registerPriority(priority)
    }
  }, [priority, context])

  if (!context) return <>{children}</>

  const isVisible = context.currentPriority >= priority

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {isVisible ? children : (fallback || null)}
    </div>
  )
}
