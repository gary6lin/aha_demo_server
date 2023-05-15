export const PasswordFormatError = {
  noLowerChar: {
    errorCode: 'pwd-no-lower',
    description: 'The password must contains at least one lowercase character.',
  },
  noUpperChar: {
    errorCode: 'pwd-no-upper',
    description: 'The password must contains at least one uppercase character.',
  },
  noNumberChar: {
    errorCode: 'pwd-no-number',
    description: 'The password must contains at least one number.',
  },
  noSpecialChar: {
    errorCode: 'pwd-no-special',
    description: 'The password must contains at least one special character.',
  },
  insufficientLength: {
    errorCode: 'pwd-length',
    description: 'The password must contains at least one 8 characters.',
  },
  hasWhitespace: {
    errorCode: 'pwd-whitespace',
    description: 'The password must not contains any whitespaces.',
  },
};

export const PasswordFormatErrorDescription = Object.entries(
  PasswordFormatError,
)
  .map((entry) => `[${entry[1].errorCode}] ${entry[1].description}`)
  .join('\n\n');
