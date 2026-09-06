import { NextResponse } from 'next/server';

import { userRepository } from '@/features/users/repositories/user.repository';
import { ResponseBuilder } from '@/lib/api/client';

export async function GET() {
  try {
    const users = await userRepository.findAll();
    return NextResponse.json(ResponseBuilder.success(users));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_FETCH_ERROR'),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.email || !body?.fullName) {
      return NextResponse.json(
        ResponseBuilder.error(
          'Email and fullName are required.',
          'VALIDATION_ERROR',
        ),
        { status: 400 },
      );
    }

    const user = await userRepository.create(body);
    return NextResponse.json(ResponseBuilder.success(user), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_CREATE_ERROR'),
      { status: 500 },
    );
  }
}
