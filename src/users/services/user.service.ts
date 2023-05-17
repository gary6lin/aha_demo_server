import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { PasswordService } from '../../auth/services/password.service';
import { AuthService } from '../../auth/services/auth.service';
import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async createUser(name: string, email: string, password: string) {
    this.passwordService.checkPassword(password);

    try {
      return await this.firebase.auth.createUser({
        displayName: name,
        email: email,
        emailVerified: false,
        password: password,
        disabled: false,
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async updateUser(
    uid: string,
    displayName: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const request: UpdateRequest = {};

    if (displayName) {
      request.displayName = displayName;
    }

    if (currentPassword && newPassword) {
      // Validate the current password
      const user = await this.firebase.auth.getUser(uid);
      await this.passwordService.validatePassword(
        currentPassword,
        user.passwordHash,
        user.passwordSalt,
      );
      // Check if the password meets all the requirements
      this.passwordService.checkPassword(newPassword);
      request.password = newPassword;
    }

    try {
      return await this.firebase.auth.updateUser(uid, request);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findUsers(maxResults?: number, pageToken?: string) {
    try {
      return await this.firebase.auth.listUsers(maxResults, pageToken);
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }
}
