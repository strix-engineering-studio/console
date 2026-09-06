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
      amount?: number;
      reason?: string;
    };

    if (typeof body.amount !== 'number') {
      return NextResponse.json(
        ResponseBuilder.error('Amount is required.', 'VALIDATION_ERROR'),
        { status: 400 },
      );
    }

    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return NextResponse.json(
        ResponseBuilder.error('User not found.', 'USER_NOT_FOUND'),
        { status: 404 },
      );
    }

    const currentBalance = Number(
      ((existingUser.preferences ?? {}) as Record<string, unknown>).coinBalance ?? 0,
    );

    const preferences = {
      ...(existingUser.preferences ?? {}),
      coinBalance: currentBalance + body.amount,
      lastCoinReason: body.reason ?? 'Balance updated',
    };

    const user = await userRepository.update(id, { preferences });

    if (!user) {
      return NextResponse.json(
        ResponseBuilder.error('User not found.', 'USER_NOT_FOUND'),
        { status: 404 },
      );
    }

    return NextResponse.json(ResponseBuilder.success(user));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update coin balance';

    return NextResponse.json(
      ResponseBuilder.error(message, 'USER_COINS_UPDATE_ERROR'),
      { status: 500 },
    );
  }
}
