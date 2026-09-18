"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INITIAL_LOGIN,
  INITIAL_REGISTER,
  type AuthMode,
  type LoginForm,
  type RegisterForm,
} from "@/types/auth.types";

type Props = {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.85 0-5.27-1.93-6.13-4.52H2.27v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.87 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.27a11 11 0 0 0 0 9.9l3.6-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.27 7.05l3.6 2.84C6.73 7.31 9.15 5.38 12 5.38Z"
    />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      fill="#1877F2"
      d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"
    />
  </svg>
);

const AuthField = ({
  id,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  trailing,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  trailing?: React.ReactNode;
}) => (
  <label htmlFor={id} className="flex flex-col gap-2">
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-12 w-full rounded-2xl border border-white/60 bg-white/15 pl-11 pr-11 text-sm text-foreground
          placeholder:text-muted-foreground/70 backdrop-blur-md backdrop-saturate-150
          transition-all duration-300
          focus:border-primary/50 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-primary/30
          dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10
        "
      />
      {trailing && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          {trailing}
        </span>
      )}
    </div>
  </label>
);

const SocialButton = ({
  provider,
  onClick,
}: {
  provider: "google" | "facebook";
  onClick: () => void;
}) => {
  const isGoogle = provider === "google";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Continue with ${isGoogle ? "Google" : "Facebook"}`}
      className="
        group inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl
        border border-white/60 bg-white/20 text-sm font-semibold text-foreground
        backdrop-blur-md backdrop-saturate-150
        transition-all duration-300
        hover:scale-[1.02] hover:border-white/90 hover:bg-white/35
        active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20
      "
    >
      {isGoogle ? (
        <GoogleIcon className="h-5 w-5 shrink-0" />
      ) : (
        <FacebookIcon className="h-5 w-5 shrink-0" />
      )}
      <span className="hidden sm:inline">
        {isGoogle ? "Google" : "Facebook"}
      </span>
    </button>
  );
};

const AuthModal = ({ open, mode, onClose, onModeChange }: Props) => {
  const [login, setLogin] = useState<LoginForm>(INITIAL_LOGIN);
  const [register, setRegister] = useState<RegisterForm>(INITIAL_REGISTER);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Auth] Login:", login);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Auth] Register:", register);
  };

  const handleGoogle = () => {
    console.log("[Auth] Google OAuth");
  };

  const handleFacebook = () => {
    console.log("[Auth] Facebook OAuth");
  };

  const isLogin = mode === "login";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isLogin ? "Login" : "Create account"}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="
              relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl
              border border-white/70 bg-background/85
              shadow-[0_30px_80px_-30px_rgba(74,46,32,0.5)]
              backdrop-blur-2xl backdrop-saturate-150
              dark:border-white/10 dark:bg-background/70
            "
          >
            <div className="relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-100/40 blur-3xl dark:bg-white/10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-6 sm:p-8">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isLogin
                    ? "Sign in to manage reservations and orders."
                    : "Join Master Table in a few seconds."}
                </p>

                <div className="mt-5 inline-flex w-full rounded-full border border-white/60 bg-white/15 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => onModeChange("login")}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                      isLogin
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeChange("register")}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                      !isLogin
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Register
                  </button>
                </div>

                <div className="mt-6">
                  {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <AuthField
                        id="login-email"
                        label="Email"
                        icon={<Mail className="h-4 w-4" />}
                        type="email"
                        value={login.email}
                        onChange={(v) =>
                          setLogin((f) => ({ ...f, email: v }))
                        }
                        placeholder="jane@example.com"
                      />
                      <AuthField
                        id="login-password"
                        label="Password"
                        icon={<Lock className="h-4 w-4" />}
                        type={showPassword ? "text" : "password"}
                        value={login.password}
                        onChange={(v) =>
                          setLogin((f) => ({ ...f, password: v }))
                        }
                        placeholder="••••••••"
                        trailing={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        }
                      />

                      <div className="flex items-center justify-between text-xs">
                        <label className="inline-flex items-center gap-2 text-muted-foreground">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-border accent-primary"
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          className="font-semibold text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="
                          inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground
                          shadow-[0_12px_32px_-12px_rgba(224,165,38,0.6)]
                          transition-all duration-300
                          hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.99]
                        "
                      >
                        Sign in
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <AuthField
                        id="register-name"
                        label="Full name"
                        icon={<User className="h-4 w-4" />}
                        value={register.name}
                        onChange={(v) =>
                          setRegister((f) => ({ ...f, name: v }))
                        }
                        placeholder="Jane Doe"
                      />
                      <AuthField
                        id="register-email"
                        label="Email"
                        icon={<Mail className="h-4 w-4" />}
                        type="email"
                        value={register.email}
                        onChange={(v) =>
                          setRegister((f) => ({ ...f, email: v }))
                        }
                        placeholder="jane@example.com"
                      />
                      <AuthField
                        id="register-password"
                        label="Password"
                        icon={<Lock className="h-4 w-4" />}
                        type={showPassword ? "text" : "password"}
                        value={register.password}
                        onChange={(v) =>
                          setRegister((f) => ({ ...f, password: v }))
                        }
                        placeholder="••••••••"
                        trailing={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        }
                      />
                      <AuthField
                        id="register-confirm"
                        label="Confirm password"
                        icon={<Lock className="h-4 w-4" />}
                        type={showPassword ? "text" : "password"}
                        value={register.confirm}
                        onChange={(v) =>
                          setRegister((f) => ({ ...f, confirm: v }))
                        }
                        placeholder="••••••••"
                      />

                      <button
                        type="submit"
                        className="
                          inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground
                          shadow-[0_12px_32px_-12px_rgba(224,165,38,0.6)]
                          transition-all duration-300
                          hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.99]
                        "
                      >
                        Create account
                      </button>
                    </form>
                  )}
                </div>

                <div className="relative my-6 flex items-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="mx-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                <div className="flex flex-row gap-3">
                  <SocialButton provider="google" onClick={handleGoogle} />
                  <SocialButton provider="facebook" onClick={handleFacebook} />
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  By continuing you agree to our{" "}
                  <span className="font-semibold text-foreground">
                    Terms & Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;