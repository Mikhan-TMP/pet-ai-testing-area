import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // console.log('Fetching pets with auth header:', authHeader ? 'Present' : 'Missing');
    
    const url = new URL(request.url);
    const petId = url.searchParams.get('pet_id');
    if (!petId) {
      throw new Error('Missing pet_id parameter');
    }

    const response = await fetch(`http://54.180.147.58/aipet/api/v1/pets/${petId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    // console.log('External API response status:', response.status);//
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (!data || !data.data) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format: missing data object');
    }
    console.log('External API response data:', JSON.stringify(data, null, 2));

    return new NextResponse(JSON.stringify(data.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Pets proxy error:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: 'error',
        message: 'Error fetching pets',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const petId = body.pet_id;
    console.log('petId:', petId);
    console.log('authHeader:', authHeader);
    console.log('payload:', body);

    if (!petId) {
      throw new Error('Missing pet_id in request body');
    }

    const { pet_id, ...payload } = body;

    const response = await fetch(`http://54.180.147.58/aipet/api/v1/pets/${petId}/status-update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Pets proxy error:', error);
    return new NextResponse(
      JSON.stringify({ 
        status: 'error',
        message: 'Error updating pet status',
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
} 