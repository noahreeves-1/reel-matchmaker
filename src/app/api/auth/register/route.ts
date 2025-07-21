import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Database Operations
// - This API route handles user registration with secure password hashing
// - Uses server-side validation, password hashing, and database operations
// - Benefits: Secure password handling, input validation, database persistence
// - Perfect for: User account creation that requires security and validation
// - Why SSR with database? Registration involves sensitive data and database operations
//
// NEXT.JS OPTIMIZATIONS:
// - Server-side input validation with Zod schemas
// - Secure password hashing with bcrypt
// - Database operations with Drizzle ORM for type safety
// - Error handling and validation responses
// - No caching - registration is a one-time operation
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Database operations vs. security and validation
// - VERCEL OPTIMIZATIONS: Serverless functions, database connection pooling
// - SCALE BREAKERS: Database connection limits, bcrypt processing time
// - FUTURE IMPROVEMENTS: Email verification, rate limiting, CAPTCHA

// Input validation schema using Zod
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

/**
 * Hash a password using bcrypt with secure salt rounds
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Secure salt rounds for password hashing
  return bcrypt.hash(password, saltRounds);
};

/**
 * Check if a user exists by email in the database
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
 * Create a new user with hashed password in the database
 */
const createUser = async (email: string, password: string, name?: string) => {
  try {
    // Hash password securely before storing
    const hashedPassword = await hashPassword(password);

    // Insert new user into database using Drizzle ORM
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

    // Validate input data using Zod schema
    const { email, password, name } = registerSchema.parse(body);

    // Check if user already exists to prevent duplicates
    const exists = await userExists(email);
    if (exists) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user with secure password hashing
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
    // Handle Zod validation errors
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
