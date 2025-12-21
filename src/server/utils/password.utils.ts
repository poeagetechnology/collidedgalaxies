import { PASSWORD_RULES } from './constants';
import type { PasswordRequirements } from '../models/auth.model';

export const validatePassword = (password: string): PasswordRequirements => {
  return {
    length: password.length >= PASSWORD_RULES.minLength,
    uppercase: PASSWORD_RULES.patterns.uppercase.test(password),
    lowercase: PASSWORD_RULES.patterns.lowercase.test(password),
    number: PASSWORD_RULES.patterns.number.test(password),
    special: PASSWORD_RULES.patterns.special.test(password),
  };
};

export const isPasswordValid = (requirements: PasswordRequirements): boolean => {
  return Object.values(requirements).every((req) => req === true);
};