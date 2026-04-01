import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Configured in auth.ts (edge-safe: no credentials here)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic =
        nextUrl.pathname === "/" ||
        nextUrl.pathname === "/login" ||
        nextUrl.pathname.startsWith("/api/auth");

      if (isPublic) {
        // Redirect logged-in users away from login page
        if (isLoggedIn && nextUrl.pathname === "/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return isLoggedIn; // Redirect unauthenticated users to login
    },
  },
} satisfies NextAuthConfig;
