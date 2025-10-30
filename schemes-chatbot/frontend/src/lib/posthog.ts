import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    // Initialize PostHog only on client side
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        // Enable session recording
        session_recording: {
          recordCrossOriginIframes: true,
        },
        // Capture pageviews automatically
        capture_pageview: true,
        // Capture pageleave events
        capture_pageleave: true,
        // Enable autocapture
        autocapture: true,
        // Disable in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing()
          }
        },
      })
    }
  }
}

export { posthog }
