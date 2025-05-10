import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, { message: '姓名不能为空' }).max(255),
  // Add other updatable fields here, e.g., avatar: z.string().url().optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: '输入无效', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name } = validation.data;

    // Check if new username is already taken by another user, if username must be unique
    // This depends on your User schema and business logic for usernames.
    // For now, we assume 'name' in User model is not strictly unique across all users, 
    // or the register logic already handles unique 'name' if it represents a username.
    // If 'name' is intended to be a unique display name, additional checks might be needed.

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        // ...update other fields if any
      },
    });

    // Omit password from the returned user object
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ user: userWithoutPassword, message: '个人信息更新成功' }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    // Check for specific Prisma errors, e.g., unique constraint violation if username needs to be unique
    // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    //   return NextResponse.json({ message: '该名称已被使用' }, { status: 409 });
    // }
    return NextResponse.json({ message: '更新个人信息失败' }, { status: 500 });
  }
} 