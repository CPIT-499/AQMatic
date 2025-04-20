import { getSession } from 'next-auth/react';

// Define backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create a dynamic import for the session on the client side
// This prevents Next.js from trying to use server components in client context
let sessionPromise: Promise<any> | null = null;

/**
 * Safe way to get authentication data that works in both client and server components
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Client-side
      if (!sessionPromise) {
        // Create the promise only once
        sessionPromise = getSession();
      }
      
      const session = await sessionPromise;
      if (session?.accessToken) {
        return { 
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        };
      }
    } else {
      // Server-side - we'll skip auth headers for now to avoid server component issues
      // For server components that need authentication, use Server Actions instead
      console.log('Server-side API call - no auth header added');
    }
  } catch (error) {
    console.error('Auth header error:', error);
  }
  
  // Default headers without auth
  return { 'Content-Type': 'application/json' };
}

/**
 * Gets the user's organization ID from the session if available
 */
async function getOrganizationId(): Promise<number | null> {
  try {
    if (typeof window !== 'undefined') {
      if (!sessionPromise) {
        sessionPromise = getSession();
      }
      
      const session = await sessionPromise;
      
      // First check the user property (standard location)
      if (session?.user?.organizationId) {
        console.log("Using organization ID from session:", session.user.organizationId);
        return session.user.organizationId;
      }
      
      // Then check if it's directly on the session (some auth providers do this)
      if (session?.organizationId) {
        console.log("Using organization ID from session root:", session.organizationId);
        return session.organizationId;
      }
      
      console.warn('No organization ID found in session:', session);
    }
  } catch (error) {
    console.error('Error getting organization ID:', error);
  }
  return null;
}

/**
 * Adds organization_id query parameter to URLs if available in session
 */
async function appendOrganizationId(endpoint: string): Promise<string> {
  const organizationId = await getOrganizationId();
  
  // If we don't have an organization ID or the endpoint already has an organization_id parameter, return as is
  if (organizationId === null || endpoint.includes('organization_id=')) {
    return endpoint;
  }
  
  // Add organization_id parameter
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}organization_id=${organizationId}`;
}

/**
 * Performs a preflight OPTIONS request to ensure CORS is working
 * This can help diagnose CORS issues early
 */
async function preflightCheck(endpoint: string): Promise<boolean> {
  try {
    // Only run preflight in browser environment
    if (typeof window === 'undefined') return true;
    
    // Fetch OPTIONS to test CORS
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      mode: 'cors'
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Preflight check failed:', error);
    return false; // Preflight failed, but we'll still try the actual request
  }
}

/**
 * Handles API request errors with detailed reporting
 */
function handleApiError(error: any, endpoint: string): never {
  // Log detailed error for developers
  console.error(`API error on ${endpoint}:`, error);
  
  // Check for CORS issues
  if (error instanceof TypeError && error.message.includes('NetworkError')) {
    throw new Error(`CORS issue detected connecting to ${API_URL}${endpoint}. Check server CORS configuration.`);
  }
  
  // Format user-friendly error message
  const errorMessage = error instanceof Error 
    ? error.message
    : 'Unknown API error occurred';
    
  throw new Error(`API request failed: ${errorMessage}`);
}

/**
 * Provides methods for making authenticated API requests
 * that work in both client and server components
 */
export const api = {
  /**
   * Makes an authenticated GET request to the backend API
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      // Append organization_id to the endpoint if available in session
      const endpointWithOrgId = await appendOrganizationId(endpoint);
      
      // Run preflight check if in browser environment
      if (typeof window !== 'undefined') {
        await preflightCheck(endpointWithOrgId);
      }
      
      const headers = await getAuthHeader();
      
      const response = await fetch(`${API_URL}${endpointWithOrgId}`, {
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },
  
  /**
   * Makes an authenticated POST request to the backend API
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      // Append organization_id to the endpoint if available in session
      const endpointWithOrgId = await appendOrganizationId(endpoint);
      
      // Run preflight check if in browser environment
      if (typeof window !== 'undefined') {
        await preflightCheck(endpointWithOrgId);
      }
      
      const headers = await getAuthHeader();
      
      const response = await fetch(`${API_URL}${endpointWithOrgId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },
  
  /**
   * Makes an authenticated PUT request to the backend API
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      // Append organization_id to the endpoint if available in session
      const endpointWithOrgId = await appendOrganizationId(endpoint);
      
      // Run preflight check if in browser environment
      if (typeof window !== 'undefined') {
        await preflightCheck(endpointWithOrgId);
      }
      
      const headers = await getAuthHeader();
      
      const response = await fetch(`${API_URL}${endpointWithOrgId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  },
  
  /**
   * Makes an authenticated DELETE request to the backend API
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      // Append organization_id to the endpoint if available in session
      const endpointWithOrgId = await appendOrganizationId(endpoint);
      
      // Run preflight check if in browser environment
      if (typeof window !== 'undefined') {
        await preflightCheck(endpointWithOrgId);
      }
      
      const headers = await getAuthHeader();
      
      const response = await fetch(`${API_URL}${endpointWithOrgId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      return handleApiError(error, endpoint);
    }
  }
};