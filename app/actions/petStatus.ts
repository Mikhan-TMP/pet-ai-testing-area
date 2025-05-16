'use server';

import mysql, { RowDataPacket } from 'mysql2/promise';

interface PetStatusRow extends RowDataPacket {
  energy_level: number;
  cleanliness_level: number;
  hunger_level: number;
  health_level: number;
  happiness_level: number;
  current_mood: string;
}

export async function getPetStatus(petId: string) {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Fetch pet status from database
    const [rows] = await connection.execute<PetStatusRow[]>(
      'SELECT energy_level, cleanliness_level, hunger_level, health_level, happiness_level, current_mood FROM pet_status WHERE pet_id = ?',
      [petId]
    );

    await connection.end();

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('Pet status not found');
    }

    return {
      energy_level: rows[0].energy_level,
      hygiene_level: rows[0].cleanliness_level,
      hunger_level: rows[0].hunger_level,
      health_level: rows[0].health_level,
      happinness_level: rows[0].happiness_level,
      mood: rows[0].current_mood
    };
  } catch (error) {
    console.error('Error fetching pet status:', error);
    throw error;
  }
} 