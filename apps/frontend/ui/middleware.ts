export const runtime = "nodejs"; // Force Node.js runtime for middleware

import { auth } from "@/auth"; // Import from relative path instead of @/

// Auth.js expects the middleware to be the default export
// or named 'middleware' if not using the matcher config object.
// Since we are using the simple export pattern, default export is preferred.
export { auth as middleware };

export const config = {
  // Skip all paths that should not use the middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};