import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Allow access to upgrade page even without subscription
        if (req.nextUrl.pathname.startsWith('/upgrade')) {
            return NextResponse.next();
        }
        
        // For dashboard routes, subscription check will be handled at component level
        // This allows us to show trial countdown and upgrade prompts
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/upgrade"],
};
