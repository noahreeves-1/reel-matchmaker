import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

// REGISTRATION API: User account creation
// This route handles new user registration with password hashing
// Validates input and creates user accounts in the database

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

/**
 * Hash a password using bcrypt
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Check if a user exists by email
 */
const userExists = async (email: string): Promise<boolean> => {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    return !!user;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};

/**
 * Create a new user with hashed password
 */
const createUser = async (email: string, password: string, name?: string) => {
  try {
    const hashedPassword = await hashPassword(password);

    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user already exists
    const exists = await userExists(email);
    if (exists) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await createUser(email, password, name);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
