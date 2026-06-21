import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { PatientsModule } from './modules/patients/patients.module';
import { StaffModule } from './modules/staff/staff.module';

@Module({
  imports: [PrismaModule, ClinicsModule, PatientsModule, StaffModule],
})
export class AppModule {}
