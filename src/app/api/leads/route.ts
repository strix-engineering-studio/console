import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Leads API ready.',
    code: 'LEADS_READY',
    meta: { timestamp: new Date().toISOString(), version: 'v1' },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      data: { ...body, id: 'lead-demo-id' },
      message: 'Lead created successfully.',
      code: 'LEAD_CREATED',
      meta: { timestamp: new Date().toISOString(), version: 'v1' },
    },
    { status: 201 },
  );
}
