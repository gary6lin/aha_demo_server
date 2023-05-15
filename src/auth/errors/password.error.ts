export const PasswordError = {
  noLowerChar: {
    errorCode: 'no-lower-char',
    description: 'The password must contains at least one lowercase character.',
  },
  noUpperChar: {
    errorCode: 'no-upper-char',
    description: 'The password must contains at least one uppercase character.',
  },
  noNumberChar: {
    errorCode: 'no-number-char',
    description: 'The password must contains at least one number.',
  },
  noSpecialChar: {
    errorCode: 'no-special-char',
    description: 'The password must contains at least one special character.',
  },
  insufficientLength: {
    errorCode: 'insufficient-length',
    description: 'The password must contains at least one 8 characters.',
  },
  hasWhitespace: {
    errorCode: 'has-whitespace',
    description: 'The password must not contains any whitespace ',
  },
};

export const PasswordErrorDescription = Object.entries(PasswordError)
  .map((entry) => `[${entry[1].errorCode}] ${entry[1].description}`)
  .join('\n\n');
