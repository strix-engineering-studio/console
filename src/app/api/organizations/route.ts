import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Organizations API ready.',
    code: 'ORGANIZATIONS_READY',
    meta: { timestamp: new Date().toISOString(), version: 'v1' },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      data: { ...body, id: 'organization-demo-id' },
      message: 'Organization created successfully.',
      code: 'ORGANIZATION_CREATED',
      meta: { timestamp: new Date().toISOString(), version: 'v1' },
    },
    { status: 201 },
  );
}
