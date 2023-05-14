import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { PasswordService } from '../../common/password.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class UserService {
  constructor(
    private readonly passwordService: PasswordService,
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async create(name: string, email: string, password: string) {
    const reasons = this.passwordService.checkPassword(password);

    if (reasons.length > 0) {
      throw new BadRequestException(reasons);
    }

    let user: UserRecord;
    try {
      user = await this.firebase.auth.createUser({
        displayName: name,
        email: email,
        emailVerified: false,
        password: password,
        disabled: false,
      });
    } catch (e) {
      throw new BadRequestException(e);
    }

    return user;
  }

  async updateDisplayName(uid: string, displayName: string) {
    return await this.firebase.auth.updateUser(uid, {
      displayName: displayName,
    });
  }

  async updatePassword(
    uid: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.firebase.auth.getUser(uid);

    const validated = await this.passwordService.validatePassword(
      currentPassword,
      user.passwordHash,
      user.passwordSalt,
    );

    if (!validated) {
      throw new BadRequestException('The password is not correct');
    }

    const reasons = this.passwordService.checkPassword(newPassword);

    if (reasons.length > 0) {
      throw new BadRequestException(reasons);
    }

    return await this.firebase.auth.updateUser(uid, {
      password: newPassword,
    });
  }
}
