export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'doctor' | 'admin';
  specialization?: string;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  specialization?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse extends User {}
