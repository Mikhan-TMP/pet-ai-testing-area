import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

interface PetStatusRow extends RowDataPacket {
  energy_level: number;
  cleanliness_level: number;
  hunger_level: number;
  health_level: number;
  happiness_level: number;
  current_mood: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('pet_id');
    const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!petId) {
      return NextResponse.json(
        { message: 'Pet ID is required' },
        { status: 400 }
      );
    }

    if (!authToken) {
      return NextResponse.json(
        { message: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Log database connection details (without password)
    console.log('Attempting database connection with:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Database connection successful');

    // Fetch pet status from database
    const [rows] = await connection.execute<PetStatusRow[]>(
      'SELECT energy_level, cleanliness_level, hunger_level, health_level, happiness_level, current_mood FROM pet_status WHERE pet_id = ?',
      [petId]
    );

    await connection.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { message: 'Pet status not found' },
        { status: 404 }
      );
    }

    // Map database column names to frontend field names
    const petStatus = {
      energy_level: rows[0].energy_level,
      hygiene_level: rows[0].cleanliness_level,
      hunger_level: rows[0].hunger_level,
      health_level: rows[0].health_level,
      happinness_level: rows[0].happiness_level,
      mood: rows[0].current_mood
    };

    return NextResponse.json(petStatus);
  } catch (error) {
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Check for specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Could not connect to database server',
            details: 'Please check if the database server is running and the connection details are correct'
          },
          { status: 500 }
        );
      }
      if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Database access denied',
            details: 'Please check your database username and password'
          },
          { status: 500 }
        );
      }
      if (error.message.includes('ER_BAD_DB_ERROR')) {
        return NextResponse.json(
          { 
            status: 'error',
            message: 'Database does not exist',
            details: 'Please check if the database name is correct'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error fetching pet status',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 