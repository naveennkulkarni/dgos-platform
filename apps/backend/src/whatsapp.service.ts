import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ 
  apiKey: "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", // IMPORTANT: Paste your Groq API key here
  baseURL: "https://api.groq.com/openai/v1" 
});

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: "dgos-clinic-bot" }),
      puppeteer: {
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        timeout: 60000
      },
    });
  }

  onModuleInit() { 
    this.initializeWhatsApp(); 
  }

  // FIXED: This prevents the server from hanging when you save changes
  async onModuleDestroy() {
    console.log('🛑 Shutting down Gateway safely...');
    try {
      await this.client.destroy();
      console.log('✅ Gateway closed and files unlocked.');
    } catch (error) {
      console.error('⚠️ Error closing gateway:', error);
    }
  }

  private async initializeWhatsApp() {
    console.log('🤖 Initializing Gateway...');

    this.client.on('qr', (qr) => qrcode.generate(qr, { small: true }));
    this.client.on('ready', () => console.log('✅ Gateway ONLINE.'));

    this.client.on('message', async (msg) => {
      if (msg.from.includes('@g.us') || msg.isStatus) return;
      if (!msg.from.includes("59816076644369")) return;

      try {
        const completion = await openai.chat.completions.create({
          model: "llama-3.1-8b-instant", 
          messages: [
            { 
              role: "system", 
              content: `You are the lead receptionist for DGOS Dental Clinic. Today is ${new Date().toISOString().split('T')[0]}.

CLINIC KNOWLEDGE BASE:
- Address: 123 Dental Avenue, Bengaluru, Karnataka.
- Hours: Mon-Sat, 9:00 AM to 7:00 PM. Closed Sundays.
- Doctors & Specialties:
  * Dr. Alex Sharma (General Dentistry & Checkups)
- General Consultation Fee: 500 INR.

STRICT RULES:
1. If the user asks about location, doctors, or services, answer politely using ONLY the Knowledge Base above.
2. CRITICAL COMMAND: If the user explicitly asks to book or confirm an appointment for a specific date and time, DO NOT be polite. DO NOT ask for confirmation.
3. You MUST stop chatting and output EXACTLY this format and nothing else: ACTION: BOOK | DATE: YYYY-MM-DD | TIME: HH:MM` 
            },
            { role: "user", content: msg.body }
          ]
        });

        const aiReply = completion.choices[0].message.content || "";
        console.log(`🤖 AI: ${aiReply}`);

        if (aiReply.includes("ACTION: BOOK")) {
          const match = aiReply.match(/DATE:\s*([0-9-]{10})\s*\|\s*TIME:\s*([0-9:]+)/);
          
          if (match) {
            const [_, date, time] = match;
            
            // 1. CLINIC & DOCTOR LOGIC (Strictly matching your schema)
            let doctor = await prisma.doctor.findFirst();
            if (!doctor) {
              console.log("⚠️ Auto-creating default clinic and doctor...");
              
              let clinic = await prisma.clinic.findFirst();
              if (!clinic) {
                clinic = await prisma.clinic.create({
                  data: { name: "DGOS Main Clinic" }
                });
              }

              doctor = await prisma.doctor.create({
                data: {
                  name: "Dr. Alex Sharma",
                  specialty: "General Dentistry",
                  clinicId: clinic.id // Correctly linking the relational ID
                }
              });
            }

            // 2. PATIENT LOGIC
            let patient = await prisma.patient.findUnique({
              where: { phone: msg.from }
            });

            if (!patient) {
              patient = await prisma.patient.create({ 
                data: { 
                  firstName: "WhatsApp", 
                  lastName: "Patient",
                  phone: msg.from 
                } 
              });
            }

            // 3. APPOINTMENT LOGIC
            await prisma.appointment.create({ 
              data: { 
                date: date, 
                time: time, 
                treatment: "Consultation", 
                value: 500, 
                status: "Scheduled", 
                doctorId: doctor.id, 
                patientId: patient.id
              } 
            });
            
            await msg.reply(`✅ Your appointment has been booked with ${doctor.name} for ${date} at ${time}. We look forward to seeing you!`);
            console.log(`✅ Appointment successfully saved for ${msg.from}`);
          } else {
            await msg.reply(aiReply);
          }
        } else {
          await msg.reply(aiReply);
        }
      } catch (error) { 
        console.error("❌ Error during processing:", error); 
        await msg.reply("System busy. Please try again.");
      }
    });

    this.client.initialize().catch((err) => {
      console.error("❌ WhatsApp initialization failed:", err.message);
      console.log("🔄 Retrying connection in 5 seconds...");
      setTimeout(() => this.initializeWhatsApp(), 5000);
    });
  }
}