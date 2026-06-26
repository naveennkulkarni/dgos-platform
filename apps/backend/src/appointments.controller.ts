import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WhatsappService } from './whatsapp.service';

const prisma = new PrismaClient();

@Controller('api/appointments')
export class AppointmentsController {
  // Inject the WhatsappService here
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('dashboard')
  async getDashboardData() {
    try {
      return await prisma.appointment.findMany({
        include: { patient: true, doctor: true },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      });
    } catch (error) {
      return { error: 'Failed to fetch dashboard data', details: error.message };
    }
  }

  // NEW: The Status Update Endpoint
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    try {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: { patient: true, doctor: true }
      });

      // THE MAGIC: If marked completed, trigger the WhatsApp gateway
      if (status === 'Completed') {
        const phone = updated.patient.phone;
        const msg = `Hi ${updated.patient.firstName}, thank you for visiting ${updated.doctor.name} today! Could you take 10 seconds to leave us a Google Review? ⭐️⭐️⭐️⭐️⭐️\n\nhttps://g.page/r/example/review`;
        
        await this.whatsappService.sendMessage(phone, msg);
      }

      return updated;
    } catch (error) {
      return { error: 'Failed to update appointment' };
    }
  }
}