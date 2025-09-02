import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return NextResponse.json({ ok: true, received: body ?? null });
}