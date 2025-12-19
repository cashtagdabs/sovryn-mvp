'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';

/**
 * Wrapper hook for Clerk's useUser that handles cases where Clerk is not configured
 * This allows the app to build without valid Clerk keys
 */
export function useUser() {
  try {
    return useClerkUser();
  } catch (error) {
    // Return mock data when Clerk is not available (e.g., during build)
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }
}
