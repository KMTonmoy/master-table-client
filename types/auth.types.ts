export type AuthMode = "login" | "register" | "forgot-password";

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

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAdmin: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

export type AuthSuccessResponse = {
  success: true;
  message?: string;
  user: AuthUser;
};

export type AuthErrorResponse = {
  success: false;
  message: string;
};

export type AuthMeResponse = {
  success: true;
  user: AuthUser;
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