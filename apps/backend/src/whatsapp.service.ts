import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { neon } from '@neondatabase/serverless';
import cron from 'node-cron';

@Injectable()
export class WhatsappService implements OnModuleInit {
    private client: Client;
    private sql = neon(process.env.DATABASE_URL!);

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
            puppeteer: {
                headless: true,
                executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--no-first-run',
                    '--no-zygote'
                ]
            }
        });
    }

    async onModuleInit() {
        // 1. Clear any potential duplicate listeners from previous failed boot attempts
        this.client.removeAllListeners('qr');
        this.client.removeAllListeners('ready');
        this.client.removeAllListeners('message');

        // 2. Explicitly handle QR Generation
        this.client.on('qr', (qr) => {
            console.log('--- QR CODE GENERATED ---');
            qrcode.generate(qr, { small: true });
            console.log('--- SCAN TO AUTHENTICATE ---');
        });

        // 3. Ready State
        this.client.on('ready', () => {
            console.log('WhatsApp Gateway is ONLINE and Authenticated');
        });

        // 4. Message Handler (Preserving your original logic)
        this.client.on('message', async (msg) => {
            console.log(`Received message: ${msg.body} from ${msg.from}`);
        });

        // 5. Initialize
        this.client.initialize();

        // 6. Schedule Marketing Funnel (10:00 AM Daily)
        cron.schedule('0 10 * * *', () => this.runMarketingFunnel());
    }

    // --- WRAPPER FOR CONTROLLERS ---
    public async sendMessage(phone: string, message: string) {
        if (!this.client) throw new Error("WhatsApp client not initialized");
        return await this.client.sendMessage(phone, message);
    }

    // --- MARKETING FUNNEL ENGINE ---
    private async runMarketingFunnel() {
        try {
            console.log("Initiating Daily Marketing Funnel...");
            
            const leads = await this.sql`
                SELECT id, phone, "firstName", "leadScore", "lastEngagement" 
                FROM "Patient" 
                WHERE status = 'ACTIVE'
            `;

            for (const lead of leads) {
                const lastEngage = new Date(lead.lastEngagement).getTime();
                const diffHours = (Date.now() - lastEngage) / (1000 * 60 * 60);

                let message = "";
                let newScore = lead.leadScore;

                if (diffHours >= 24 && diffHours < 48) {
                    message = `Hi ${lead.firstName}, I noticed you haven't booked yet. I'm holding a priority slot this week—would you like to secure it?`;
                    newScore += 5;
                } else if (diffHours >= 48 && diffHours < 168) {
                    message = `Hi ${lead.firstName}, check out why our patients rate us #1 for dental outcomes. We’d love to help you achieve the same results.`;
                    newScore += 10;
                } else if (diffHours >= 168 && diffHours < 360) {
                    message = `Hi ${lead.firstName}, neglecting routine checkups often leads to higher long-term costs. Let's prevent that together.`;
                } else if (diffHours >= 504) {
                    message = `Hi ${lead.firstName}, our new diagnostic protocol is live. We can compare your previous outcomes to your current health. Ready to see the improvement?`;
                    newScore -= 20;
                }

                if (message) {
                    await this.sendMessage(lead.phone, message);
                    await this.sql`
                        UPDATE "Patient" 
                        SET "lastEngagement" = NOW(), "leadScore" = ${newScore} 
                        WHERE id = ${lead.id}
                    `;
                }
            }
        } catch (e) {
            console.error("Marketing Funnel Error:", e);
        }
    }
}