import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AppService {
  // --- CLINICAL & PATIENT DATA ---
  async getPatients() { return await (prisma as any).patient.findMany(); }
  async getTeeth(patientId: string) { return await (prisma as any).tooth.findMany({ where: { patientId } }); }
  async getTimeline(patientId: string) { return await (prisma as any).patientTimeline.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }); }

  async getRecallList() {
    try {
      const patients = await (prisma as any).patient.findMany();
      const timelines = await (prisma as any).patientTimeline.findMany();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      return patients.filter((p: any) => {
        const pTimelines = timelines.filter((t: any) => t.patientId === p.id);
        if (pTimelines.length === 0) return false;
        const lastVisit = new Date(Math.max(...pTimelines.map((t: any) => new Date(t.createdAt).getTime())));
        return lastVisit < sixMonthsAgo;
      });
    } catch { return []; }
  }

  async updateTooth(patientId: string, toothData: any) {
    const pricing: Record<string, number> = {
      "Consultation": 500, "Consultant Doctor": 800, "Follow-up": 300, "IOPA Film X-Ray": 500, "Digital RVG X-Ray": 500,
      "GIC Restoration": 1500, "Composite Restoration": 2500, "Diastema Closure": 4500, "Anterior Fracture repair": 4000,
      "Anterior RCT": 6000, "Posterior RCT": 8000, "Third Molar RCT": 9000, "Repeat RCT": 9000, "Core Buildup GIC": 1500, "Core Buildup Composite": 3500,
      "Ni-Cr Metal Crown": 4500, "Co-Cr Metal Crown": 4500, "PFM Crown": 6000, "CAD CAM PFM": 7000, "Zirconia Crown": 14000, "BruxZir Crown": 14000, "Lava/Procera/E-max": 15000, "Heat Cure Crown": 2000, "Re-cementation Single Crown": 700, "Re-cementation Bridge": 1500,
      "Standard Acrylic Denture": 25000, "Lucitone Denture": 35000, "High Impact Denture": 45000, "Flexible Denture": 50000, "BPS Denture": 55000,
      "RPD Single Tooth": 5000, "RPD Additional Tooth": 500, "Cast Partial Denture": 28000, "CPD Additional Tooth": 1000, "Flexible RPD": 20000,
      "Extraction Primary Tooth": 1200, "Pediatric Restoration": 1800, "Pediatric Pulpectomy": 4500, "Pre-Formed Metal Crown": 4000, "Fluoride Application": 3500,
      "Laminates/Veneers": 15000, "Direct Composite Veneers": 6000, "Dental Bleaching": 15000, "Depigmentation": 6000,
      "Metal Braces": 35000, "Ceramic Braces": 50000, "Lingual Braces": 90000, "Night Guard/Splint": 5000, "Clear Aligners": 150000,
      "Extraction - Mobile Tooth": 1500, "Extraction - Firm tooth": 3000, "Extraction - Surgical/Badly Carious": 4000, "Extraction - Erupted Third Molar": 5000, "Disimpaction": 9000,
      "Implant Placement": 40000, "Implant Prosthesis PFM": 9000, "Implant Prosthesis Zirconia": 15000,
      "Oral Prophylaxis & Polishing": 3500, "Flap Surgery": 8000, "Gingivectomy/CLP": 3500
    };
    
    const treatment = toothData.treatment;
    const cost = pricing[treatment] || 0;

    const record = await (prisma as any).tooth.upsert({
      where: { patientId_toothNumber: { patientId, toothNumber: toothData.toothNumber } },
      update: { caries: treatment, restoration: cost.toString() },
      create: { patientId, toothNumber: toothData.toothNumber, caries: treatment, restoration: cost.toString() }
    });

    await (prisma as any).patientTimeline.create({
      data: { patientId, eventType: "TREATMENT_PLAN", eventJson: { tooth: toothData.toothNumber, treatment, value: cost } }
    });
    return record;
  }

  async acceptTreatment(patientId: string, data: any) {
    return await (prisma as any).patientTimeline.create({
      data: { patientId, eventType: "TREATMENT_ACCEPTED", eventJson: { tooth: data.toothNumber, treatment: data.treatment, value: data.value } }
    });
  }

  async saveClinicalNote(patientId: string, data: any) {
    return await (prisma as any).patientTimeline.create({
      data: { patientId, eventType: "CLINICAL_NOTE", eventJson: data }
    });
  }

  // --- RECEPTION & SCHEDULE DATA ---
  async getDoctors() {
    try {
      let doctors = await (prisma as any).doctor.findMany();
      if (doctors.length === 0) {
        const clinic = await (prisma as any).clinic.findFirst();
        if (clinic) {
          const newDoc = await (prisma as any).doctor.create({
            data: { name: "Dr. Sarah Smith", specialty: "Prosthodontics", clinicId: clinic.id }
          });
          doctors = [newDoc];
        }
      }
      return doctors;
    } catch { return []; }
  }

  async getAppointments(date: string) {
    try {
      return await (prisma as any).appointment.findMany({
        where: { date },
        include: { patient: true, doctor: true },
        orderBy: { time: 'asc' }
      });
    } catch { return []; }
  }

  async bookAppointment(data: any) {
    return await (prisma as any).appointment.create({
      data: {
        patientId: data.patientId, doctorId: data.doctorId, date: data.date, time: data.time,
        treatment: data.treatment, value: parseInt(data.value) || 0, status: "SCHEDULED"
      }
    });
  }

  async getPendingBookings() {
    try {
      return await (prisma as any).patientTimeline.findMany({
        where: { eventType: "TREATMENT_PLAN" },
        include: { patient: true },
        orderBy: { createdAt: 'desc' }
      });
    } catch { return []; }
  }

  // --- FINANCIAL LEDGER & CEO METRICS ---
  async processInvoiceAndPayment(patientId: string, payload: any) {
    const invoiceRecord = await (prisma as any).patientTimeline.create({
      data: {
        patientId,
        eventType: "FINANCIAL_INVOICE",
        eventJson: {
          invoiceId: `INV-${Date.now().toString().substring(7)}`,
          items: payload.items,
          baseTotal: payload.baseTotal,
          discountApplied: payload.discountAmount,
          taxAmount: payload.taxAmount,
          grandTotal: payload.grandTotal,
          balanceDue: payload.balanceDue,
          pendingReason: payload.pendingReason || null,
          expectedPendingMode: payload.expectedPendingMode || null,
          status: payload.balanceDue <= 0 ? "PAID" : "PARTIALLY_PAID"
        }
      }
    });

    if (payload.payments && payload.payments.length > 0) {
      for (const payment of payload.payments) {
        await (prisma as any).patientTimeline.create({
          data: {
            patientId,
            eventType: "FINANCIAL_LEDGER_ENTRY",
            eventJson: {
              invoiceId: invoiceRecord.eventJson.invoiceId,
              method: payment.method,
              amountPaid: payment.amount,
              referenceNumber: payment.referenceNumber || "N/A",
              financeProvider: payment.financeProvider || null,
              emiTerm: payment.emiTerm || null,
              fromAccount: payment.fromAccount || null,
              toAccount: payment.toAccount || null,
              notes: payment.notes || "",
              transactionDate: new Date().toISOString()
            }
          }
        });
      }
    }
    return invoiceRecord;
  }

  async getDashboardMetrics() {
    try {
      const timelines = await (prisma as any).patientTimeline.findMany();
      let presented = 0;
      let accepted = 0;
      
      let totalInvoiced = 0;
      let totalCollected = 0;
      const modeBreakdown: Record<string, number> = {
        "UPI": 0, "Credit Card": 0, "Cash": 0, "Digital Finance": 0, "EMI Installment": 0, "Cheque": 0, "Account Transfer": 0
      };

      timelines.forEach((t: any) => {
        if (t.eventType === "TREATMENT_PLAN") presented += (t.eventJson.value || 0);
        if (t.eventType === "TREATMENT_ACCEPTED") accepted += (t.eventJson.value || 0);
        if (t.eventType === "FINANCIAL_INVOICE") totalInvoiced += (t.eventJson.grandTotal || 0);
        if (t.eventType === "FINANCIAL_LEDGER_ENTRY") {
          const amt = t.eventJson.amountPaid || 0;
          totalCollected += amt;
          const method = t.eventJson.method;
          if (modeBreakdown[method] !== undefined) modeBreakdown[method] += amt;
        }
      });

      const rate = presented > 0 ? Math.round((accepted / presented) * 100) : 0;
      const totalOutstanding = totalInvoiced - totalCollected;

      return {
        totalPresented: presented,
        acceptedValue: accepted,
        acceptanceRate: `${rate}%`,
        totalInvoiced,
        totalCollected,
        totalOutstanding: totalOutstanding > 0 ? totalOutstanding : 0,
        modeBreakdown
      };
    } catch { 
      return { totalPresented: 0, acceptedValue: 0, acceptanceRate: "0%", totalInvoiced: 0, totalCollected: 0, totalOutstanding: 0, modeBreakdown: {} }; 
    }
  }

  // --- NEW: SALES, MARKETING & GROWTH HUB ENGINE ---
  async getLeads() {
    try {
      return await (prisma as any).lead.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch { return []; }
  }

  async createLead(data: any) {
    return await (prisma as any).lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        source: data.source || "Direct/Walk-in",
        intent: data.intent || "General Inquiry",
        status: data.status || "Inquiry",
        score: data.score || "Medium"
      }
    });
  }

  async updateLeadStatus(id: string, status: string) {
    return await (prisma as any).lead.update({
      where: { id },
      data: { status }
    });
  }

  async getCampaigns() {
    try {
      return await (prisma as any).campaign.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch { return []; }
  }
}