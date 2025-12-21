export interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormData {
  email: string;
  password: string;
  name?: string;
}

export interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export type AuthMode = 'login' | 'signup' | 'forgot-password';