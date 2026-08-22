export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  workEmail: string;
  password: string;
  companyName: string;
}
