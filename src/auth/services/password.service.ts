import { BadRequestException, Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { PasswordFormatError } from '../errors/password-format.error';
import { InvalidPasswordError } from '../errors/invalid-password.error';

@Injectable()
export class PasswordService {
  // Contains at least one lower character
  lowerChar = /^(?=.*[a-z]).*$/;
  // Contains at least one upper character
  upperChar = /^(?=.*[A-Z]).*$/;
  // Contains at least one digit character
  numberChar = /^(?=.*\d).*$/;
  // Contains at least one special character
  specialChar = /^(?=.*[^a-zA-Z0-9\d\s]).*$/;
  // Contains at least 8 characters
  passwordLength = /^.{8,}$/;
  // No whitespace is allowed
  noWhitespace = /^\S*$/;

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
      throw new BadRequestException(InvalidPasswordError);
    }
  }

  async hashPassword(password: string) {
    const passwordSalt = await genSalt(10);
    const passwordHash = await hash(password, passwordSalt);
    return { passwordHash: passwordHash, passwordSalt: passwordSalt };
  }

  checkDisplayName(name: string) {
    if (this.numberChar.test(name) || this.specialChar.test(name)) {
      throw new BadRequestException(
        'Numbers and special characters are not allowed.',
      );
    }
  }

  checkPassword(password: string) {
    // RegExp combined all the requirements
    // const combined =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\d\s])(?!.*\s).{8,}$/;

    // Check if the password matches all the requirements
    const errors = [];
    if (!this.lowerChar.test(password)) {
      errors.push(PasswordFormatError.noLowerChar);
    }
    if (!this.upperChar.test(password)) {
      errors.push(PasswordFormatError.noUpperChar);
    }
    if (!this.numberChar.test(password)) {
      errors.push(PasswordFormatError.noNumberChar);
    }
    if (!this.specialChar.test(password)) {
      errors.push(PasswordFormatError.noSpecialChar);
    }
    if (!this.passwordLength.test(password)) {
      errors.push(PasswordFormatError.insufficientLength);
    }
    if (!this.noWhitespace.test(password)) {
      errors.push(PasswordFormatError.hasWhitespace);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
