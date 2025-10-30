import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'default'
  
  // Create a fresh session ID each time (don't persist in localStorage)
  // This ensures each browser session starts fresh
  let sessionId = sessionStorage.getItem('schemes-session-id')
  if (!sessionId) {
    sessionId = 'schemes-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
    sessionStorage.setItem('schemes-session-id', sessionId)
  }
  return sessionId
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('schemes-session-id')
    localStorage.removeItem('schemes-session-id') // Clean up old localStorage too
  }
}
