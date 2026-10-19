export type AuthMode = "login" | "register";

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthUser = {
  id: string;
  firebaseUid?: string | null;
  name: string;
  email: string;
  profileImage: string;
  role: "user" | "admin";
  provider: string;
  isVerified: boolean;
  phone: string;
  addresses: Address[];
  defaultAddressId: string | null;
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