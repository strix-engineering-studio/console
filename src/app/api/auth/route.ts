import { NextResponse } from 'next/server';

import { userRepository } from '@/features/users/repositories/user.repository';
import { Gender, MembershipType, UserStatus } from '@/features/users/types/users.enums';
import { ResponseBuilder } from '@/lib/api/client';

export async function GET() {
  return NextResponse.json(
    ResponseBuilder.success({
      authenticated: false,
      provider: 'local-prisma',
      message: 'Auth module is ready.',
    }),
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      fullName?: string;
      mobileNo?: string;
    };

    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json(
        ResponseBuilder.error('Email is required.', 'VALIDATION_ERROR'),
        { status: 400 },
      );
    }

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        ResponseBuilder.success({
          user: existingUser,
          token: 'dev-token-for-local-auth',
        }),
      );
    }

    const newUser = await userRepository.create({
      fullName: body.fullName || email.split('@')[0],
      email,
      mobileNo: body.mobileNo || '',
      membershipType: MembershipType.FREE,
      gender: Gender.OTHER,
      status: UserStatus.ACTIVE,
      isActive: true,
      isExpert: false,
    });

    return NextResponse.json(
      ResponseBuilder.success({
        user: newUser,
        token: 'dev-token-for-local-auth',
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Auth failed';

    return NextResponse.json(
      ResponseBuilder.error(message, 'AUTH_ERROR'),
      { status: 500 },
    );
  }
}
