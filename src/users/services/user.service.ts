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
import { MAX_PAGE_SIZE } from '../constants';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async createUser(name: string, email: string, password: string) {
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
      const tokensValidAfterTime = userRecord.tokensValidAfterTime;
      const lastSignInTime = userRecord.metadata.lastSignInTime;
      const lastRefreshTime = userRecord.metadata.lastRefreshTime;
      return await this.upsertUserCopy({
        ...userRecord,
        tokensValidAfterTime: tokensValidAfterTime
          ? new Date(tokensValidAfterTime)
          : null,
        metadata: {
          creationTime: new Date(userRecord.metadata.creationTime),
          lastSignInTime: lastSignInTime
            ? new Date(lastSignInTime)
            : lastSignInTime,
          lastRefreshTime: lastRefreshTime
            ? new Date(lastRefreshTime)
            : lastRefreshTime,
        },
      } as UserModel);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findUser(uid: string) {
    try {
      // Attempt to find the user from our database
      const userCopy = await this.prisma.userCopy.findUnique({
        where: { uid: uid },
      });
      return { ...userCopy, metadata: { ...userCopy } };
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

  async findUsers(pageSize = MAX_PAGE_SIZE, pageToken?: string) {
    try {
      // Find the users from our database for a more granular control
      const userCopies = await this.prisma.userCopy.findMany({
        skip: pageToken ? 0 : 1, // Skip the cursor
        take: pageSize > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : pageSize,
        cursor: {
          uid: pageToken,
        },
      });
      // Cast the db entity to a model that we can play with
      return userCopies.map((userCopy) => ({
        ...userCopy,
        metadata: {
          ...userCopy,
        },
      })) as UserModel[];
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async upsertUserCopy(data: UserModel) {
    // Update an existing user or create a new user if not exist
    return this.prisma.userCopy.upsert({
      where: {
        uid: data.uid,
      },
      create: { ...data, ...data.metadata },
      update: { ...data, ...data.metadata },
    });
  }

  async countUsers() {
    // Count the total number of users
    try {
      return await this.prisma.userCopy.count();
    } catch (e) {
      throw new BadRequestException(e);
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
      return await this.prisma.userCopy.count({
        where: {
          lastSignInTime: {
            gte: start,
            lte: end,
          },
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private userRecordToUserModel(userRecord: any) {
    const tokensValidAfterTime = userRecord.tokensValidAfterTime;
    const lastSignInTime = userRecord.metadata.lastSignInTime;
    const lastRefreshTime = userRecord.metadata.lastRefreshTime;
    return {
      ...userRecord,
      tokensValidAfterTime: tokensValidAfterTime
        ? new Date(tokensValidAfterTime)
        : null,
      metadata: {
        creationTime: new Date(userRecord.metadata.creationTime),
        lastSignInTime: lastSignInTime
          ? new Date(lastSignInTime)
          : lastSignInTime,
        lastRefreshTime: lastRefreshTime
          ? new Date(lastRefreshTime)
          : lastRefreshTime,
      },
    } as UserModel;
  }
}
