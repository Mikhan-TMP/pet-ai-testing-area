import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = 'http://54.180.147.58/aipet//api/v1/constants/interaction-types';

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}