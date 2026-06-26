'use server';

import { neon } from '@neondatabase/serverless';

export async function getLiveMetrics() {
  try {
    // Connects directly to Neon using your environment variable
    const sql = neon(process.env.DATABASE_URL!);
    
    // Count every patient/lead we logged from WhatsApp
    const result = await sql`SELECT COUNT(*) FROM "Patient"`;
    const totalLeads = Number(result[0].count);
    
    return {
      leads: totalLeads,
      pipeline: totalLeads * 500 // Calculates your pipeline value
    };
  } catch (error) {
    console.error("Database fetch failed:", error);
    return { leads: 0, pipeline: 0 };
  }
}