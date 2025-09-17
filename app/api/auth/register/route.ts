import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { 
  withErrorHandler, 
  handleDatabaseOperation,
  ConflictError,
  validateRequest
} from "@/lib/api-error-handler";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  
  // Validate input
  const validatedData = validateRequest<z.infer<typeof registerSchema>>(registerSchema, body);
  const { name, email, password } = validatedData;

  // Check if user already exists
  const existingUser = await handleDatabaseOperation(async () => {
    return prisma.user.findUnique({
      where: { email }
    });
  });

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await handleDatabaseOperation(async () => {
    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });
  });

  return NextResponse.json(
    { 
      message: "User created successfully",
      user 
    },
    { status: 201 }
  );
});