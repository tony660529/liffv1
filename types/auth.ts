import { Customer, gender_type } from './customer';

export interface AuthState {
  isAuthenticated: boolean;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: gender_type;
  birthday: string;
  city: string;
  district: string;
} 