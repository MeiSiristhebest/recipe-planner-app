import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: '当前密码不能为空' }),
  newPassword: z.string().min(8, { message: '新密码至少需要8个字符' }),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id || !session.user.email) { // email needed to fetch full user details if password is not on session
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: '输入无效', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      // This case should ideally not happen if user is logged in via credentials
      return NextResponse.json({ message: '用户不存在或未设置密码' }, { status: 400 });
    }

    const isCurrentPasswordValid = await compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: '当前密码不正确' }, { status: 400 });
    }

    if (currentPassword === newPassword) {
        return NextResponse.json({ message: '新密码不能与当前密码相同' }, { status: 400 });
    }

    const hashedNewPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: '密码更新成功' }, { status: 200 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: '更新密码失败' }, { status: 500 });
  }
} 