// // middleware.ts
// export { default } from "next-auth/middleware"

// // The config object tells NextAuth which routes to protect.
// export const config = {
//   // In this example, only requests to /dashboard (and sub-paths) 
//   // require authentication. The homepage (/) will be public.
//   matcher: ["/dashboard/:path*", "/profile/:path*"] 
// }

import { withAuth } from "next-auth/middleware"

// Middleware implementation
export default withAuth({
  // This ensures the middleware knows where your custom login page is
  pages: {
    signIn: '/login',
  },
})

// Configuration to apply middleware only to specific routes
export const config = {
  // Update this list to match the routes you want to PROTECT
  matcher: ["/dashboard/:path*", "/profile/:path*"]
}