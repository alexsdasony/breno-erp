import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Frontend test endpoint working',
    timestamp: new Date().toISOString()
  });
}

export async function PUT() {
  return NextResponse.json({
    success: true,
    message: 'PUT method working',
    timestamp: new Date().toISOString()
  });
}
