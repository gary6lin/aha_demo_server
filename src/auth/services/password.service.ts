import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PasswordError } from '../errors/password.error';

@Injectable()
export class PasswordService {
  async validatePassword(
    currentPassword: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    // Hash the user's input password using bcrypt with the same salt used by Firebase Auth
    const hashedPassword = await hash(currentPassword, passwordSalt);

    // Throw an error if the hash generated from the currentPassword
    // does not match to the passwordHash stored on Firebase Auth
    if (hashedPassword != passwordHash) {
      throw new BadRequestException('The password is not correct');
    }
  }

  checkPassword(password: string) {
    // Contains at least one lower character
    const lowerChar = /^(?=.*[a-z]).*$/;
    // Contains at least one upper character
    const upperChar = /^(?=.*[A-Z]).*$/;
    // Contains at least one digit character
    const numberChar = /^(?=.*\d).*$/;
    // Contains at least one special character
    const specialChar = /^(?=.*[^a-zA-Z0-9\d\s]).*$/;
    // Contains at least 8 characters
    const passwordLength = /^.{8,}$/;
    // No whitespace is allowed
    const noWhitespace = /^\S*$/;

    // RegExp combined all the above requirements
    // const combined =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\d\s])(?!.*\s).{8,}$/;

    // Check if the password match the above requirements
    const errors: { errorCode: string; description: string }[] = [];
    if (!lowerChar.test(password)) {
      errors.push(PasswordError.noLowerChar);
    }
    if (!upperChar.test(password)) {
      errors.push(PasswordError.noUpperChar);
    }
    if (!numberChar.test(password)) {
      errors.push(PasswordError.noNumberChar);
    }
    if (!specialChar.test(password)) {
      errors.push(PasswordError.noSpecialChar);
    }
    if (!passwordLength.test(password)) {
      errors.push(PasswordError.insufficientLength);
    }
    if (!noWhitespace.test(password)) {
      errors.push(PasswordError.hasWhitespace);
    }

    throw new BadRequestException(errors);
  }
}
