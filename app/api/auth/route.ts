import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import * as jose from 'jose';

// In a real application, you would use a database
let users = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "$2a$10$LuqPBKL3fEkn/QQHfvAt1.Oy.K/IHHU6PVT6EEnC54Zak.eAVxBMq", // password123
        role: "user"
    },
      {
        id: 1,
        name: "Rafay",
        email: "rafay@gmail.com",
        password: "$2a$10$o0ikhjK1pXpOZmr4U3TAZusB15MAF2baj4ayb05dqyh4pauSdMNDS", // 123456
        role: "user"
    }
];

// Validation schemas
const signupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["user", "admin"]).default("user")
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // In production, use environment variable

// Signup handler
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = signupSchema.parse(body);

        // Check if user already exists
        const existingUser = users.find(u => u.email === validatedData.email);
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role
        };

        users.push(newUser);

        // Generate access and refresh tokens
        const secret = new TextEncoder().encode(JWT_SECRET);
        const accessToken = await new jose.SignJWT({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            type: 'access'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m') // Short-lived access token
            .sign(secret);

        const refreshToken = await new jose.SignJWT({
            userId: newUser.id,
            type: 'refresh'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d') // Longer-lived refresh token
            .sign(secret);

        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            message: "User created successfully",
            user: userWithoutPassword,
            accessToken,
            refreshToken
        },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input", errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Error creating user" },
            { status: 500 }
        );
    }
}

// Login handler
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = loginSchema.parse(body);

        // Find user
        const user = users.find(u => u.email === validatedData.email);
        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }        // Generate access and refresh tokens
        const secret = new TextEncoder().encode(JWT_SECRET);
        const accessToken = await new jose.SignJWT({
            userId: user.id,
            email: user.email,
            role: user.role,
            type: 'access'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m') // Short-lived access token
            .sign(secret);

        const refreshToken = await new jose.SignJWT({
            userId: user.id,
            type: 'refresh'
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d') // Longer-lived refresh token
            .sign(secret);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: "Login successful",
            user: userWithoutPassword,
            accessToken,
            refreshToken
        },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input", errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: "Error logging in" },
            { status: 500 }
        );
    }
}
