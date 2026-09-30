export type AuthMode = "login" | "register" | "forgot-password";

export type LoginForm = {
  email: string;
  password: string;
};

export type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

export type ForgotPasswordForm = {
  email: string;
};

export type AuthRole = "user" | "admin";

export type AuthProvider = "email" | "google" | "facebook";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: AuthRole;
  provider: AuthProvider;
  isVerified?: boolean;
};

export const INITIAL_LOGIN: LoginForm = {
  email: "",
  password: "",
};

export const INITIAL_REGISTER: RegisterForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

export const INITIAL_FORGOT_PASSWORD: ForgotPasswordForm = {
  email: "",
};
