import { NextResponse } from 'next/server';

import { userRepository } from '@/features/users/repositories/user.repository';
import { ResponseBuilder } from '@/lib/api/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      preferences?: Record<string, unknown>;
    };

    if (!body.preferences || typeof body.preferences !== 'object') {
      return NextResponse.json(
        ResponseBuilder.error('Preferences are required.', 'VALIDATION_ERROR'),
        { status: 400 },
      );
    }

    const user = await userRepository.update(id, { preferences: body.preferences });

    if (!user) {
      return NextResponse.json(
        ResponseBuilder.error('User not found.', 'USER_NOT_FOUND'),
        { status: 404 },
      );
    }

    return NextResponse.json(ResponseBuilder.success(user));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update user preferences';

    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_PREFERENCES_UPDATE_ERROR'),
      { status: 500 },
    );
  }
}
