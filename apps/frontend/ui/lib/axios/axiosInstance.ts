import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach auth token and organization_id param automatically
axiosInstance.interceptors.request.use(async (config) => {
  // Only attempt session retrieval in browser
  if (typeof window === 'undefined') return config;
  let session;
  try {
    const { getSession } = await import('next-auth/react');
    session = await getSession();
  } catch (err) {
    console.warn('Axios interceptor dynamic getSession error:', err);
  }
  if (session?.accessToken) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  const orgId = session?.user?.organizationId;
  if (orgId) {
    config.params = { ...(config.params || {}), organization_id: orgId };
  }
  return config;
});

export default axiosInstance;