/**
 * Password validation rules matching the backend @StrongPasswordValidator.
 *
 * Backend constraint: @StrongPassword
 *   - At least 8 characters
 *   - At least one uppercase letter (A-Z)
 *   - At least one lowercase letter (a-z)
 *   - At least one digit (0-9)
 *   - At least one special character (@$!%*?&)
 */

export const PASSWORD_RULES = [
  {
    id: 'len',
    label: 'At least 8 characters',
    test: (p) => p.length >= 8,
  },
  {
    id: 'upper',
    label: 'At least one uppercase letter (A–Z)',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lower',
    label: 'At least one lowercase letter (a–z)',
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: 'digit',
    label: 'At least one digit (0–9)',
    test: (p) => /\d/.test(p),
  },
  {
    id: 'spec',
    label: 'At least one special character (@$!%*?&)',
    test: (p) => /[@$!%*?&]/.test(p),
  },
];

/**
 * Returns true only if ALL password rules pass.
 * @param {string} password
 * @returns {boolean}
 */
export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/**
 * Returns an array of rule objects that currently FAIL for the given password.
 * @param {string} password
 * @returns {Array}
 */
export function getFailedRules(password) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}
