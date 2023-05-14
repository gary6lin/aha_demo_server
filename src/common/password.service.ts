import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';

@Injectable()
export class PasswordService {
  async validatePassword(
    password: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    // Hash the user's input password using bcrypt with the same salt used by Firebase Auth
    const hashedPassword = await hash(password, passwordSalt);

    // Compare the hashed passwords
    return hashedPassword == passwordHash;
  }

  checkPassword(password: string) {
    // const passwordRegex =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\d\s])(?!.*\s).{8,}$/;

    // Contains at least one lower character
    const lowerChar = /^(?=.*[a-z]).*$/;
    // Contains at least one upper character
    const upperChar = /^(?=.*[A-Z]).*$/;
    // Contains at least one digit character
    const digitChar = /^(?=.*\d).*$/;
    // Contains at least one special character
    const specialChar = /^(?=.*[^a-zA-Z0-9\d\s]).*$/;
    // Contains at least 8 characters
    const passwordLength = /^.{8,}$/;
    // No whitespace is allowed
    const noWhitespace = /^\S*$/;

    // Check if the password match the above requirements
    const reasons: string[] = [];
    if (!lowerChar.test(password)) {
      reasons.push('Must contains at least one lower character');
    }
    if (!upperChar.test(password)) {
      reasons.push('Must contains at least one upper character');
    }
    if (!digitChar.test(password)) {
      reasons.push('Must contains at least one digit character');
    }
    if (!specialChar.test(password)) {
      reasons.push('Must contains at least one special character');
    }
    if (!passwordLength.test(password)) {
      reasons.push('Must contains at least 8 characters');
    }
    if (!noWhitespace.test(password)) {
      reasons.push('Must not contains any whitespace');
    }

    return reasons;
  }
}
