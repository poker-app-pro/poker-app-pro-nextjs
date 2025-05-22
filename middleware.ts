import { fetchAuthSession } from "aws-amplify/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "@/lib/amplify-utils";

const publicRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const { pathname } = request.nextUrl;

    const userSession = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec);
          return session;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    });

    if (!userSession) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const authenticated = userSession.tokens !== undefined;

    // Helper function to check if the current path matches any of our patterns
    const isPublicPath = () => {
      return publicRoutes.includes(pathname);
    };

    if (!authenticated && isPublicPath()) {
      return response;
    }

    if (authenticated && pathname === "/") {
      return NextResponse.redirect(new URL("/results", request.url));
    }

    if (authenticated) {
      return response;
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
