import { NextResponse } from "next/server";

// Dummy user data
let users = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user"
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "admin"
    },
    {
        id: 3,
        name: "Bob Wilson",
        email: "bob@example.com",
        role: "user"
    }
];

export async function GET() {
    try {
        return NextResponse.json(
            {
                message: "Users fetched successfully",
                users
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching users" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const { name, email, role } = await request.json();
    const newUser = {
        id: users[users.length - 1].id + 1,
        name,
        email,
        role
    };

    users.push(newUser);

    try {
        return NextResponse.json(
            {
                message: "Users created successfully",
                newUser
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching users" },
            { status: 500 }
        );
    }
}


export async function DELETE(request: Request) {
    const { id } = await request.json();
    users = users.filter(user => user.id !== id);

    try {
        return NextResponse.json(
            {
                message: "Users deleted successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching users" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    const { id, name, email, role } = await request.json();
    users = users.map(user => {
        if (user.id === id) {
            return { ...user, name, email, role };
        }
        return user;
    });
    try {
        return NextResponse.json(
            {
                message: "Users updated successfully",
                users
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching users" },
            { status: 500 }
        );
    }
}