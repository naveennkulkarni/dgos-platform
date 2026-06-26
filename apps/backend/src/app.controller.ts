import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --- CLINICAL ENDPOINTS ---
  @Get('patients') async getPatients() { return await this.appService.getPatients(); }
  @Get('teeth/:patientId') async getTeeth(@Param('patientId') p: string) { return await this.appService.getTeeth(p); }
  @Get('timeline/:patientId') async getTimeline(@Param('patientId') p: string) { return await this.appService.getTimeline(p); }
  @Get('recall') async getRecallList() { return await this.appService.getRecallList(); }
  
  @Post('teeth') async updateTooth(@Body() d: any) { return await this.appService.updateTooth(d.patientId, d); }
  @Post('accept') async acceptTreatment(@Body() d: any) { return await this.appService.acceptTreatment(d.patientId, d); }
  @Post('notes') async saveClinicalNote(@Body() d: any) { return await this.appService.saveClinicalNote(d.patientId, d); }
  
  // --- FINANCIAL & CEO ENDPOINTS ---
  @Post('invoice-payment') async processInvoiceAndPayment(@Body() d: any) { return await this.appService.processInvoiceAndPayment(d.patientId, d); }
  @Get('metrics') async getMetrics() { return await this.appService.getDashboardMetrics(); }
  
  // --- RECEPTION ENDPOINTS ---
  @Get('doctors') async getDoctors() { return await this.appService.getDoctors(); }
  @Get('appointments') async getAppointments(@Query('date') date: string) { return await this.appService.getAppointments(date); }
  @Post('appointments') async bookAppointment(@Body() d: any) { return await this.appService.bookAppointment(d); }
  @Get('pending-bookings') async getPendingBookings() { return await this.appService.getPendingBookings(); }

  // --- NEW: GROWTH & SALES ENDPOINTS ---
  @Get('leads') async getLeads() { return await this.appService.getLeads(); }
  @Post('leads') async createLead(@Body() d: any) { return await this.appService.createLead(d); }
  @Patch('leads/:id/status') async updateLeadStatus(@Param('id') id: string, @Body('status') status: string) { 
    return await this.appService.updateLeadStatus(id, status); 
  }
  @Get('campaigns') async getCampaigns() { return await this.appService.getCampaigns(); }
}