import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.StaffCreateInput) {
    return this.prisma.staff.create({ data });
  }

  findAll() {
    return this.prisma.staff.findMany();
  }

  findOne(id: string) {
    return this.prisma.staff.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.StaffUpdateInput) {
    return this.prisma.staff.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.staff.delete({ where: { id } });
  }
}
