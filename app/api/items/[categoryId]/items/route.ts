// app/api/items/[categoryId]/items/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Define the context type manually
type Context = {
  params: {
    categoryId: string;
  };
};

export async function GET(
  request: NextRequest,
  context: Context
) {
  const { categoryId } = context.params;
  const apiUrl = `http://54.180.147.58/aipet/api/v1/store/${categoryId}/items`;
  const authHeader = request.headers.get('authorization');

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: authHeader || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch Items' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
