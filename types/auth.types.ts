export type AuthMode = "login" | "register";

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