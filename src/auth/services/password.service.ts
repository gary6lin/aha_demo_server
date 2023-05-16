import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PasswordFormatError } from '../errors/password-format.error';
import { InvalidPasswordError } from '../errors/invalid-password.error';

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
      throw new BadRequestException(InvalidPasswordError);
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
    const errors = [];
    if (!lowerChar.test(password)) {
      errors.push(PasswordFormatError.noLowerChar);
    }
    if (!upperChar.test(password)) {
      errors.push(PasswordFormatError.noUpperChar);
    }
    if (!numberChar.test(password)) {
      errors.push(PasswordFormatError.noNumberChar);
    }
    if (!specialChar.test(password)) {
      errors.push(PasswordFormatError.noSpecialChar);
    }
    if (!passwordLength.test(password)) {
      errors.push(PasswordFormatError.insufficientLength);
    }
    if (!noWhitespace.test(password)) {
      errors.push(PasswordFormatError.hasWhitespace);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
