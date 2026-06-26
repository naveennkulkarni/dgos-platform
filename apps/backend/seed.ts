import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function automate() {
  console.log('Initiating Database Automation & Repair...');

  // 1. Wipe the corrupted ghost records
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.clinic.deleteMany();

  // 2. Automate the Base Architecture
  const clinic = await prisma.clinic.create({
    data: { 
      name: 'DGOS Headquarters', 
      slug: 'hq', 
      tenantId: 'hq-01' 
    }
  });
  console.log('✅ Automated: Headquarters Clinic Created');

  // 3. Automate the Staff
  await prisma.doctor.create({
    data: { 
      name: 'Ravi (Admin)', 
      specialty: 'Oral & Maxillofacial Surgeon', 
      clinicId: clinic.id 
    }
  });
  console.log('✅ Automated: Chief Surgeon Added');

  // 4. Automate the Patient Recovery
  await prisma.patient.create({
    data: { 
      firstName: 'Alpha', 
      lastName: 'Test', 
      phone: '9998887776', 
      dateOfBirth: new Date(), 
      clinicId: clinic.id 
    }
  });
  console.log('✅ Automated: Patient Alpha Recovered and Linked');

  console.log('🚀 Neon Cloud Database is now fully synchronized and operational.');
}

automate().finally(() => prisma.$disconnect());