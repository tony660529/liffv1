export type gender_type = 'male' | 'female' | 'other';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: gender_type;
  birthday: string;
  city: string;
  district: string;
  line_id: string | null;
  membership_level: string;
  total_spent: number;
  last_purchase_date: string | null;
  created_at: string;
  updated_at: string;
} 