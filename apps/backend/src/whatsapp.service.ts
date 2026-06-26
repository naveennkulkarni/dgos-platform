import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ 
  apiKey: "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", // IMPORTANT: Ensure your Groq key is pasted here
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
        
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu'],
        timeout: 60000
      },
    });
  }

  onModuleInit() { this.initializeWhatsApp(); }

  async onModuleDestroy() {
    console.log('🛑 Shutting down Gateway safely...');
    try {
      await this.client.destroy();
      console.log('✅ Gateway closed.');
    } catch (error) {
      console.error('⚠️ Error closing gateway:', error);
    }
  }

  async sendMessage(to: string, body: string) {
    try {
      const formattedNumber = to.includes('@') ? to : `${to}@c.us`;
      await this.client.sendMessage(formattedNumber, body);
    } catch (error) {
      console.error(`❌ Failed to send message:`, error);
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
        // 1. Fetch or Create Patient immediately so we can attach notes to them
        let patient = await prisma.patient.findUnique({ where: { phone: msg.from } });
        if (!patient) {
          patient = await prisma.patient.create({ 
            data: { firstName: "WhatsApp", lastName: "Patient", phone: msg.from } 
          });
        }

        // ==========================================
        // NEW: THE VISION & DOCUMENT AGENT
        // ==========================================
        if (msg.hasMedia) {
          const media = await msg.downloadMedia();
          
          if (media && media.mimetype.startsWith('image/')) {
            await msg.reply("📷 *Scanning Image...* Please wait while our AI analyzes this.");
            console.log("👁️ Vision Agent activated. Analyzing media...");

            // Pass the image to the Vision AI
            const visionCompletion = await openai.chat.completions.create({
              model: "llama-3.2-11b-vision-preview", // Groq's high-speed Vision model
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: "You are a clinical dental assistant. Briefly describe this image. If it is teeth or an X-ray, note any visible issues. Keep it strictly to 2 short sentences." },
                    { type: "image_url", image_url: { url: `data:${media.mimetype};base64,${media.data}` } }
                  ]
                }
              ]
            });

            const clinicalNotes = visionCompletion.choices[0].message.content || "Image reviewed, but no notes generated.";
            
            // Append the new notes to the patient's file
            const previousNotes = patient.medicalNotes ? `${patient.medicalNotes}\n` : "";
            await prisma.patient.update({
              where: { id: patient.id },
              data: { medicalNotes: `${previousNotes}[${new Date().toISOString().split('T')[0]}] ${clinicalNotes}` }
            });

            await msg.reply(`✅ *Clinical Summary Saved to Profile:*\n_${clinicalNotes}_\n\nDr. Alex Sharma will review this before your appointment.`);
            return; // Stop here, don't run the standard booking AI
          }
        }
        // ==========================================

        // --- STANDARD TEXT CONVERSATION & BOOKING ---
        let memoryContext = "You are talking to a new, unregistered patient. Be warm and welcoming.";
        if (patient.firstName !== "WhatsApp") {
          memoryContext = `CRITICAL CONTEXT: You are talking to a returning patient named ${patient.firstName} ${patient.lastName}. Greet them by name.`;
        }

        const completion = await openai.chat.completions.create({
          model: "llama-3.1-8b-instant", 
          messages: [
            { 
              role: "system", 
              content: `You are the lead receptionist for DGOS Dental Clinic. Today is ${new Date().toISOString().split('T')[0]}.

${memoryContext}

CLINIC KNOWLEDGE BASE:
- Address: 123 Dental Avenue, Bengaluru, Karnataka.
- Hours: Mon-Sat, 9:00 AM to 7:00 PM. Closed Sundays.
- Doctors: Dr. Alex Sharma
- Consultation Fee: 500 INR.

STRICT RULES:
1. Answer politely using ONLY the Knowledge Base.
2. If they ask to book an appointment for a specific date and time, DO NOT be polite. DO NOT ask for confirmation.
3. Output EXACTLY this format and nothing else: ACTION: BOOK | DATE: YYYY-MM-DD | TIME: HH:MM` 
            },
            { role: "user", content: msg.body }
          ]
        });

        const aiReply = completion.choices[0].message.content || "";

        if (aiReply.includes("ACTION: BOOK")) {
          const match = aiReply.match(/DATE:\s*([0-9-]{10})\s*\|\s*TIME:\s*([0-9:]+)/);
          
          if (match) {
            const [_, date, time] = match;
            
            let doctor = await prisma.doctor.findFirst();
            if (!doctor) {
              let clinic = await prisma.clinic.findFirst();
              if (!clinic) clinic = await prisma.clinic.create({ data: { name: "DGOS Main Clinic" } });
              doctor = await prisma.doctor.create({
                data: { name: "Dr. Alex Sharma", specialty: "General Dentistry", clinicId: clinic.id }
              });
            }

            await prisma.appointment.create({ 
              data: { date, time, treatment: "Consultation", value: 500, status: "Scheduled", doctorId: doctor.id, patientId: patient.id } 
            });
            
            await msg.reply(`✅ Your appointment has been booked with ${doctor.name} for ${date} at ${time}. We look forward to seeing you!`);
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
      setTimeout(() => this.initializeWhatsApp(), 5000);
    });
  }

  @Cron('* * * * *') 
  async handleAutomatedReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    try {
      const upcomingAppointments = await prisma.appointment.findMany({
        where: { date: tomorrowString, status: 'Scheduled' },
        include: { patient: true, doctor: true }
      });

      if (upcomingAppointments.length === 0) return;

      for (const apt of upcomingAppointments) {
        const reminderMsg = `🤖 *Automated Reminder*\n\nHi ${apt.patient.firstName}, this is DGOS Dental Clinic! We are looking forward to seeing you tomorrow (${apt.date}) at ${apt.time}.`;
        await this.sendMessage(apt.patient.phone, reminderMsg);
      }
    } catch (error) {}
  }
}