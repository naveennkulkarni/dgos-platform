'use server';

import { neon } from '@neondatabase/serverless';

export async function getLiveMetrics() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT COUNT(*) FROM "Patient"`;
    const totalLeads = Number(result[0].count);
    return { leads: totalLeads, pipeline: totalLeads * 500 };
  } catch (error) {
    return { leads: 0, pipeline: 0 };
  }
}

export async function getAppointments() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    return await sql`
      SELECT a.date, a.time, a.status, p."firstName", p."lastName" 
      FROM "Appointment" a
      JOIN "Patient" p ON a."patientId" = p.id
      ORDER BY a.date ASC, a.time ASC
    `;
  } catch (error) {
    return [];
  }
}

export async function getPatientNotes(phone: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT "medicalNotes" FROM "Patient" WHERE phone = ${phone}`;
    return result[0]?.medicalNotes || "No clinical notes found for this number.";
  } catch (error) {
    return "Error fetching clinical records.";
  }
}