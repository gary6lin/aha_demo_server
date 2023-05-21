// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../database/prisma.service';
//
// @Injectable()
// export class ProfileService {
//   constructor(private prisma: PrismaService) {}
//
//   async upsert(uid: string) {
//     this.prisma.profile.count({
//       where: {},
//     });
//
//     const profile = await this.prisma.profile.upsert({
//       where: {
//         uid: uid,
//       },
//       create: { uid: '' },
//       update: { createdAt: '' },
//     });
//   }
//
//   async findOne(uid: string): Promise<ProfileModel> {
//     return this.prisma.profile.findUnique({
//       where: {
//         uid: uid,
//       },
//     });
//   }
// }
