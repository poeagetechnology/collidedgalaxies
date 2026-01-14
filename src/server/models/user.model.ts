import { User } from 'firebase/auth';

export interface FirestoreUser {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  createdAt: any;
  updatedAt: any;
}

export type { User };