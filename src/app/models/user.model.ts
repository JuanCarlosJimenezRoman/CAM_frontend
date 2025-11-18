export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}