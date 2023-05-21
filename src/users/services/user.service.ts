import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { PasswordService } from '../../auth/services/password.service';
import { AuthService } from '../../auth/services/auth.service';
import { PrismaService } from '../../database/prisma.service';
import { UserModel } from '../models/user.model';
import { DEFAULT_NUMBER_OF_DAYS } from '../constants';
import { UserRecordEntity } from '../entities/user-record.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async createUser(name: string, email: string, password: string) {
    // Check if the password meets all the requirements
    this.passwordService.checkPassword(password);
    try {
      // Create a new user on Firebase Auth
      const userRecord = await this.firebase.auth.createUser({
        displayName: name,
        email: email,
        emailVerified: false,
        password: password,
        disabled: false,
      });
      // And make a copy in our database as well
      const userModel = this.userRecordToUserModel(userRecord);
      return await this.upsertUserCopy(userModel);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findUser(uid: string) {
    try {
      // Attempt to find the user from our database
      const userCopy = await this.prisma.userCopy.findUnique({
        where: { uid: uid },
      });
      return userCopy as UserModel;
    } catch (e) {
      try {
        // Then try the Firebase Auth if an unexpected error occurs
        const userRecord = await this.firebase.auth.getUser(uid);
        return this.userRecordToUserModel(userRecord);
      } catch (e) {
        throw new InternalServerErrorException(e);
      }
    }
  }

  async updateUserInfo(uid: string, displayName: string) {
    try {
      // Update the user on Firebase Auth
      const userRecord = await this.firebase.auth.updateUser(uid, {
        displayName: displayName,
      });
      // And update the user in our database as well
      const userModel = this.userRecordToUserModel(userRecord);
      return await this.upsertUserCopy(userModel);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async updateUserPassword(
    uid: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Validate the current password
    const user = await this.findUser(uid);

    // The password hash and salt must exist
    if (user.passwordHash && user.passwordSalt) {
      throw new BadRequestException();
    }

    // Validate the current password
    await this.passwordService.validatePassword(
      currentPassword,
      user.passwordHash,
      user.passwordSalt,
    );
    // Check if the password meets all the requirements
    this.passwordService.checkPassword(newPassword);

    try {
      // Update the password on Firebase Auth
      const userRecord = await this.firebase.auth.updateUser(uid, {
        password: newPassword,
      });
      // And update the password in our database as well
      const userModel = this.userRecordToUserModel(userRecord);
      return await this.upsertUserCopy(userModel);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findUsers(pageSize: number, pageToken?: string) {
    if (pageSize < 1) {
      throw new BadRequestException();
    }
    try {
      // Find the users from our database for a more granular control
      const userCopies = await this.prisma.userCopy.findMany({
        skip: pageToken ? 1 : 0, // Skip the cursor
        take: 20,
        cursor: pageToken
          ? {
              uid: pageToken,
            }
          : undefined,
        orderBy: {
          creationTime: 'asc',
        },
      });
      return userCopies as UserModel[];
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async pullUserAndUpdate(uid: string) {
    try {
      // Get the user from Firebase Auth
      const userRecord = await this.firebase.auth.getUser(uid);
      // And update the password in our database as well
      const userModel = this.userRecordToUserModel(userRecord);
      return await this.upsertUserCopy(userModel);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async upsertUserCopy(data: UserModel) {
    try {
      // Update an existing user or create a new user if not exist
      return await this.prisma.userCopy.upsert({
        where: {
          uid: data.uid,
        },
        create: { ...data },
        update: { ...data },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async countUsers() {
    try {
      // Count the total number of users
      return await this.prisma.userCopy.count();
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async countActiveUsers() {
    // Count the total number of active users
    try {
      // The start of today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      // The end of today
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      // Anyone signed in between the start and end of today's date will be count as active
      const activeUsers = await this.prisma.userCopy.count({
        where: {
          lastSignInTime: {
            gte: start,
            lte: end,
          },
        },
      });
      // Store the result to the database
      await this.upsertStatistic(start, activeUsers);
      return activeUsers;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async upsertStatistic(date: Date, activeUsers: number) {
    try {
      // Update the existing active user count or create a new record it goes to the next day
      return this.prisma.statistic.upsert({
        where: {
          date: date,
        },
        create: { date: date, activeUsers: activeUsers },
        update: { activeUsers: activeUsers },
      });
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findAverageActiveUsers(days: number) {
    // The number of days must be at least 2 days for calculating the average
    if (days < 2) {
      throw new BadRequestException();
    }
    try {
      // Update the existing active user count or create a new record it goes to the next day
      const take = days ?? DEFAULT_NUMBER_OF_DAYS;
      const records = await this.prisma.statistic.findMany({
        take: take,
        orderBy: {
          date: 'desc',
        },
      });
      // Calculates the average number
      let sum = 0;
      for (const record of records) {
        sum += record.activeUsers;
      }
      const nod = records.length; // Use the result length in case if the records are less than the desired number of days
      return sum / nod;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  private userRecordToUserModel(userRecord: UserRecordEntity) {
    const tokensValidAfterTime = userRecord.tokensValidAfterTime;
    const lastSignInTime = userRecord.metadata.lastSignInTime;
    const lastRefreshTime = userRecord.metadata.lastRefreshTime;
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      passwordHash: userRecord.passwordHash,
      passwordSalt: userRecord.passwordSalt,
      tokensValidAfterTime: tokensValidAfterTime
        ? new Date(tokensValidAfterTime)
        : tokensValidAfterTime,
      creationTime: new Date(userRecord.metadata.creationTime),
      lastSignInTime: lastSignInTime
        ? new Date(lastSignInTime)
        : lastSignInTime,
      lastRefreshTime: lastRefreshTime
        ? new Date(lastRefreshTime)
        : lastRefreshTime,
    } as UserModel;
  }
}
