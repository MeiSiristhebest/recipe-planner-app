import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from here
import { z } from 'zod';

const registerUserSchema = z.object({
  username: z.string().min(2, { message: '用户名至少需要2个字符' }),
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(8, { message: '密码至少需要8个字符' }),
  // We don't need confirmPassword here as it's validated on the client
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: '输入无效', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { username, email, password } = validation.data;

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return NextResponse.json({ message: '该邮箱已被注册' }, { status: 409 });
    }

    // It's also good practice to check for unique usernames if your schema enforces it
    const existingUserByUsername = await prisma.user.findUnique({
        where: { name: username }, // Assuming your User model has a 'name' field for username
    });
    if (existingUserByUsername) {
        return NextResponse.json({ message: '该用户名已被使用' }, { status: 409 });
    }


    const hashedPassword = await hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: username, // Make sure your Prisma schema has a 'name' field for username
        email,
        password: hashedPassword,
        // You might want to add other default fields here, e.g., emailVerified: null
      },
    });

    // Omit password from the returned user object
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ user: userWithoutPassword, message: '用户注册成功' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
} 