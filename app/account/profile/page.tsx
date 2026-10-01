"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AtSign,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { imageUpload } from "@/lib";
import type { AuthUser } from "@/types/auth.types";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type FormState = {
  name: string;
  userEmail: string;
  profileImage: string;
};

type PasswordForm = {
  current: string;
  next: string;
  confirm: string;
};

const emptyPassword: PasswordForm = { current: "", next: "", confirm: "" };

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const extractError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      fallback
    );
  }
  return err instanceof Error ? err.message : fallback;
};

const passwordStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-destructive",
    "bg-destructive",
    "bg-amber-500",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-400",
  ];
  return { score, label: labels[score], color: colors[score] };
};

const ProfilePage = () => {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<FormState>({
    name: "",
    userEmail: "",
    profileImage: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfileAt, setSavedProfileAt] = useState<number | null>(null);
  const [imagePreviewBroken, setImagePreviewBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>(
    {},
  );

  const [pwd, setPwd] = useState<PasswordForm>(emptyPassword);
  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaved, setPwdSaved] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [resetSentAt, setResetSentAt] = useState<number | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const savedTimerRef = useRef<number | null>(null);
  const pwdTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const uploadTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
          `${API_URL}/api/auth/me`,
          { withCredentials: true },
        );
        if (cancelled) return;
        if (!data?.user) {
          router.replace("/");
          return;
        }
        setUser(data.user);
        setProfile({
          name: data.user.name ?? "",
          userEmail: data.user.email ?? "",
          profileImage: data.user.profileImage ?? "",
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(extractError(err, "Failed to load your profile"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      if (pwdTimerRef.current) window.clearTimeout(pwdTimerRef.current);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      if (uploadTimerRef.current) window.clearTimeout(uploadTimerRef.current);
    };
  }, []);

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.userEmail.trim()),
    [profile.userEmail],
  );
  const isNameValid = profile.name.trim().length >= 2;

  const isDirty =
    user !== null &&
    (profile.name.trim() !== user.name ||
      profile.userEmail.trim().toLowerCase() !== user.email.toLowerCase() ||
      profile.profileImage.trim() !== (user.profileImage ?? ""));

  const canSaveProfile =
    isDirty && isNameValid && isEmailValid && !savingProfile && !uploading;

  const pwdMismatch = pwd.confirm.length > 0 && pwd.next !== pwd.confirm;
  const pwdTooShort = pwd.next.length > 0 && pwd.next.length < 8;
  const pwdSame = pwd.next.length > 0 && pwd.next === pwd.current;
  const canSavePassword =
    pwd.current.length > 0 &&
    pwd.next.length >= 8 &&
    pwd.next === pwd.confirm &&
    !pwdSame &&
    !savingPwd;

  const strength = useMemo(() => passwordStrength(pwd.next), [pwd.next]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(8);

    if (uploadTimerRef.current) window.clearTimeout(uploadTimerRef.current);
    const tick = window.setInterval(() => {
      setUploadProgress((p) => (p >= 90 ? 90 : p + 6));
    }, 120);

    try {
      const url = await imageUpload(file);
      setImagePreviewBroken(false);
      setProfile((f) => ({ ...f, profileImage: url }));
      setUploadProgress(100);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload image",
      );
      setUploadProgress(0);
    } finally {
      window.clearInterval(tick);
      uploadTimerRef.current = window.setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const clearImage = () => {
    setProfile((f) => ({ ...f, profileImage: "" }));
    setImagePreviewBroken(false);
    setUploadError(null);
  };

  const submitProfile = async () => {
    if (!user || !canSaveProfile) return;
    setSavingProfile(true);
    setError(null);
    try {
      await axios.patch(
        `${API_URL}/users/${encodeURIComponent(user.email)}`,
        {
          name: profile.name.trim(),
          userName: profile.name.trim(),
          userEmail: profile.userEmail.trim().toLowerCase(),
          profileImage: profile.profileImage.trim(),
        },
        { withCredentials: true },
      );

      const { data } = await axios.get<{ success: boolean; user: AuthUser }>(
        `${API_URL}/api/auth/me`,
        { withCredentials: true },
      );
      if (data?.user) {
        setUser(data.user);
        setProfile({
          name: data.user.name ?? "",
          userEmail: data.user.email ?? "",
          profileImage: data.user.profileImage ?? "",
        });
      }

      setSavedProfileAt(Date.now());
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(
        () => setSavedProfileAt(null),
        2400,
      );
      router.refresh();
    } catch (err) {
      setError(extractError(err, "Failed to save your profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async () => {
    if (!canSavePassword) return;
    setSavingPwd(true);
    setPwdError(null);
    try {
      await axios.post(
        `${API_URL}/api/auth/change-password`,
        {
          currentPassword: pwd.current,
          newPassword: pwd.next,
        },
        { withCredentials: true },
      );
      setPwd(emptyPassword);
      setPwdSaved(true);
      if (pwdTimerRef.current) window.clearTimeout(pwdTimerRef.current);
      pwdTimerRef.current = window.setTimeout(() => setPwdSaved(false), 2600);
    } catch (err) {
      setPwdError(extractError(err, "Failed to update password"));
    } finally {
      setSavingPwd(false);
    }
  };

  const sendResetEmail = async () => {
    if (!user || sendingReset) return;
    setSendingReset(true);
    setResetError(null);
    try {
      await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email: user.email },
        { withCredentials: true },
      );
      setResetSentAt(Date.now());
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(
        () => setResetSentAt(null),
        6000,
      );
    } catch (err) {
      setResetError(extractError(err, "Failed to send reset email"));
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const showImage = profile.profileImage.trim() && !imagePreviewBroken;
  const isAdmin = user.role === "admin";
  const isEmailAccount = user.provider === "email";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <UserIcon className="h-3.5 w-3.5" />
          Account
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Your profile
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Manage your personal details, profile image, and account security.
        </p>
      </motion.header>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-amber-400 text-4xl font-bold text-[#2B1B10] shadow-2xl ring-4 ring-background sm:h-32 sm:w-32">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profileImage.trim()}
                  alt=""
                  onError={() => setImagePreviewBroken(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                initialsOf(profile.name || user.name)
              )}
            </span>
            {isAdmin && (
              <span className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-background">
                <ShieldCheck className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {profile.name.trim() || user.name}
            </h2>
            <p className="mt-1 flex items-center gap-2 truncate text-base text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              {profile.userEmail.trim() || user.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                  isAdmin
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/20 text-primary",
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {isAdmin ? "Admin" : "Customer"}
              </span>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <AtSign className="h-3.5 w-3.5" />
                {user.provider}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5 sm:px-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <UserIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Personal information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your name, email, and profile picture.
                </p>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:p-8">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Full name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((f) => ({ ...f, name: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  autoComplete="name"
                  placeholder="Your full name"
                  className={cn(
                    "flex h-12 w-full rounded-2xl border bg-background px-4 text-base text-foreground outline-none transition-all",
                    "focus-visible:ring-4 focus-visible:ring-primary/20",
                    touched.name && !isNameValid
                      ? "border-destructive/60"
                      : "border-border focus:border-primary",
                  )}
                />
                <AnimatePresence>
                  {touched.name && !isNameValid && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Name must be at least 2 characters
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.userEmail}
                  onChange={(e) =>
                    setProfile((f) => ({ ...f, userEmail: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    "flex h-12 w-full rounded-2xl border bg-background px-4 text-base text-foreground outline-none transition-all",
                    "focus-visible:ring-4 focus-visible:ring-primary/20",
                    touched.email && !isEmailValid
                      ? "border-destructive/60"
                      : "border-border focus:border-primary",
                  )}
                />
                <AnimatePresence>
                  {touched.email && !isEmailValid && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-destructive"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Enter a valid email address
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  Profile image
                </span>

                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {showImage ? "Replace image" : "Upload image"}
                        </>
                      )}
                    </button>

                    {showImage && !uploading && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                  </div>

                  <AnimatePresence>
                    {uploading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Uploading to Cloudinary… {uploadProgress}%
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {uploadError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          {uploadError}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="mt-3 text-xs text-muted-foreground">
                    JPG, PNG, or WebP. Maximum 5 MB. Uploaded to Cloudinary.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-6 py-5 sm:px-8">
              <AnimatePresence mode="wait">
                {savedProfileAt ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    <Check className="h-4 w-4" />
                    Profile saved
                  </motion.span>
                ) : isDirty ? (
                  <motion.span
                    key="dirty"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-sm text-amber-600 dark:text-amber-400"
                  >
                    Unsaved changes
                  </motion.span>
                ) : (
                  <motion.span
                    key="clean"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-sm text-muted-foreground"
                  >
                    Up to date
                  </motion.span>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProfile({
                      name: user.name,
                      userEmail: user.email,
                      profileImage: user.profileImage ?? "",
                    });
                    setImagePreviewBroken(false);
                    setUploadError(null);
                    setTouched({});
                  }}
                  disabled={!isDirty || savingProfile || uploading}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={submitProfile}
                  disabled={!canSaveProfile}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-destructive/30"
                >
                  <div className="bg-destructive/5 px-6 py-4 text-sm text-destructive sm:px-8">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {isEmailAccount && (
            <motion.section
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5 sm:px-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Change password
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use at least 8 characters with a mix of letters and numbers.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8">
                <div>
                  <label
                    htmlFor="pwd-current"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      id="pwd-current"
                      type={showPwd.current ? "text" : "password"}
                      value={pwd.current}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, current: e.target.value }))
                      }
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 pr-12 text-base text-foreground outline-none transition-all focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPwd((s) => ({ ...s, current: !s.current }))
                      }
                      aria-label={
                        showPwd.current
                          ? "Hide current password"
                          : "Show current password"
                      }
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {showPwd.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pwd-next"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="pwd-next"
                        type={showPwd.next ? "text" : "password"}
                        value={pwd.next}
                        onChange={(e) =>
                          setPwd((p) => ({ ...p, next: e.target.value }))
                        }
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 pr-12 text-base text-foreground outline-none transition-all focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPwd((s) => ({ ...s, next: !s.next }))
                        }
                        aria-label={
                          showPwd.next
                            ? "Hide new password"
                            : "Show new password"
                        }
                        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {showPwd.next ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pwd-confirm"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        id="pwd-confirm"
                        type={showPwd.confirm ? "text" : "password"}
                        value={pwd.confirm}
                        onChange={(e) =>
                          setPwd((p) => ({ ...p, confirm: e.target.value }))
                        }
                        autoComplete="new-password"
                        placeholder="Repeat new password"
                        className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 pr-12 text-base text-foreground outline-none transition-all focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPwd((s) => ({ ...s, confirm: !s.confirm }))
                        }
                        aria-label={
                          showPwd.confirm
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {showPwd.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {pwd.next.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Password strength
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          strength.score <= 1 && "text-destructive",
                          strength.score === 2 && "text-amber-500",
                          strength.score === 3 && "text-amber-400",
                          strength.score >= 4 && "text-emerald-500",
                        )}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            i < strength.score
                              ? strength.color
                              : "bg-secondary",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {(pwdMismatch || pwdTooShort || pwdSame) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                        {pwdTooShort && (
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Must be at least 8 characters
                          </li>
                        )}
                        {pwdMismatch && (
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            Passwords do not match
                          </li>
                        )}
                        {pwdSame && (
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            New password must be different from current
                          </li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {pwdError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {pwdError}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-6 py-5 sm:px-8">
                <AnimatePresence mode="wait">
                  {pwdSaved ? (
                    <motion.span
                      key="pwd-saved"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      <Check className="h-4 w-4" />
                      Password updated
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pwd-clean"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm text-muted-foreground"
                    >
                      Choose a strong, unique password.
                    </motion.span>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={submitPassword}
                  disabled={!canSavePassword}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-[#2B1B10] transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPwd ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Update password
                    </>
                  )}
                </button>
              </div>
            </motion.section>
          )}

          <motion.section
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5 sm:px-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
                <Send className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Forgot password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send a reset link to your email address.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:p-8">
              <div className="flex items-start gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                <div>
                  <p className="font-medium text-foreground">
                    We&apos;ll email a reset link to{" "}
                    <span className="text-primary">{user.email}</span>
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {isEmailAccount
                      ? "Use this if you don't remember your current password."
                      : `Even though you signed in with ${user.provider}, you can set a password to sign in with email as well.`}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {resetSentAt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Reset link sent. Check your inbox and spam folder.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {resetError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-6 py-5 sm:px-8">
              <span className="text-sm text-muted-foreground">
                The link expires in 30 minutes.
              </span>

              <button
                type="button"
                onClick={sendResetEmail}
                disabled={sendingReset || !!resetSentAt}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 text-sm font-semibold text-white transition-all hover:bg-sky-500/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingReset ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : resetSentAt ? (
                  <>
                    <Check className="h-4 w-4" />
                    Sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send reset link
                  </>
                )}
              </button>
            </div>
          </motion.section>
        </div>

        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-6 lg:sticky lg:top-24"
        >
          <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">
                Account snapshot
              </h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="truncate font-medium text-foreground">
                  {user.name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium text-foreground">
                  {user.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="font-medium text-foreground">{user.provider}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Role</dt>
                <dd
                  className={cn(
                    "font-medium",
                    isAdmin ? "text-emerald-500" : "text-primary",
                  )}
                >
                  {isAdmin ? "Admin" : "Customer"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Verified</dt>
                <dd className="font-medium text-foreground">
                  {user.isVerified ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">
                Security tips
              </h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Use a unique password you don&apos;t use anywhere else.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Long passphrases beat short complex passwords.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Store passwords in a manager, never in a note.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Changing your email will sign you out of other devices.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">
                Coming soon
              </h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Two-factor authentication and passkeys are on the roadmap.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                2FA
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Passkeys
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                Sessions
              </span>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default ProfilePage;
