import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ClinicCreateInput) {
    return this.prisma.clinic.create({ data });
  }

  findAll() {
    return this.prisma.clinic.findMany();
  }

  findOne(id: string) {
    return this.prisma.clinic.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.ClinicUpdateInput) {
    return this.prisma.clinic.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.clinic.delete({ where: { id } });
  }
}
