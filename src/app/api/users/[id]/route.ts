import { NextResponse } from 'next/server';

import { userRepository } from '@/features/users/repositories/user.repository';
import { ResponseBuilder } from '@/lib/api/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await userRepository.findById(id);

    if (!user) {
      return NextResponse.json(
        ResponseBuilder.error('User not found.', 'USER_NOT_FOUND'),
        { status: 404 },
      );
    }

    return NextResponse.json(ResponseBuilder.success(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_FETCH_ERROR'),
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await userRepository.update(id, body);

    if (!user) {
      return NextResponse.json(
        ResponseBuilder.error('User not found.', 'USER_NOT_FOUND'),
        { status: 404 },
      );
    }

    return NextResponse.json(ResponseBuilder.success(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_UPDATE_ERROR'),
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await userRepository.remove(id);
    return NextResponse.json(ResponseBuilder.success(null));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_DELETE_ERROR'),
      { status: 500 },
    );
  }
}
