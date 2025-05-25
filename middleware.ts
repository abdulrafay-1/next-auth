import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Add the paths that should be protected
const protectedPaths = ["/api/users"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Check if the path should be protected
    if (protectedPaths.some(prefix => path.startsWith(prefix))) {
        const token = request.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        try {
            // Verify the token using jose
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jose.jwtVerify(token, secret);

            // Add user info to request headers
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-user-id", payload.userId as string);
            requestHeaders.set("x-user-role", payload.role as string);

            // Return response with modified headers
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                }
            });
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid token", error: error instanceof Error ? error.message : "Unknown error" },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
}
