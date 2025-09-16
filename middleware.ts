import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        
        // Protect API routes that require authentication
        if (req.nextUrl.pathname.startsWith("/api/posts") && req.method !== "GET") {
          return !!token;
        }
        
        if (req.nextUrl.pathname.startsWith("/api/categories") && req.method !== "GET") {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/posts/:path*",
    "/api/categories/:path*"
  ]
};