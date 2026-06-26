import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappService } from './whatsapp.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [
    ScheduleModule.forRoot() // Turns on the Time Machine
  ],
  controllers: [AppController, AppointmentsController],
  providers: [AppService, WhatsappService],
})
export class AppModule {}