import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Profile as ProfileModel } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(uid: string): Promise<ProfileModel> {
    return this.prisma.profile.create({
      data: {
        uid: uid,
      },
    });
  }

  async findOne(uid: string): Promise<ProfileModel> {
    return this.prisma.profile.findUnique({
      where: {
        uid: uid,
      },
    });
  }
}
