import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PatientCreateInput) {
    return this.prisma.patient.create({ data });
  }

  findAll() {
    return this.prisma.patient.findMany();
  }

  findOne(id: string) {
    return this.prisma.patient.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.PatientUpdateInput) {
    return this.prisma.patient.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.patient.delete({ where: { id } });
  }
}
