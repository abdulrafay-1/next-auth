import { NextResponse } from "next/server";
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
    try {
        const { refreshToken } = await request.json();

        if (!refreshToken) {
            return NextResponse.json(
                { message: "Refresh token required" },
                { status: 400 }
            );
        }

        // Verify the refresh token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(refreshToken, secret);

        // Check if it's actually a refresh token
        if (payload.type !== 'refresh') {
            return NextResponse.json(
                { message: "Invalid token type" },
                { status: 401 }
            );
        }

        // Generate new access token
        const newAccessToken = await new jose.SignJWT({
            userId: payload.userId,
            type: 'access'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m')
            .sign(secret);

        return NextResponse.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Invalid refresh token" },
            { status: 401 }
        );
    }
}
