"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  AtSign,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Mail,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { imageUpload } from "@/lib";
import { axiosInstance } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/types/auth.types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type FormState = {
  name: string;
  email: string;
  profileImage: string;
};

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const extractError = (err: unknown, fallback: string) => {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return data?.error || data?.message || err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

function ProfileForm({ user }: { user: AuthUser }) {
  const reduce = useReducedMotion();
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState<FormState>({
    name: user.name ?? "",
    email: user.email ?? "",
    profileImage: user.profileImage ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfileAt, setSavedProfileAt] = useState<number | null>(null);
  const [imagePreviewBroken, setImagePreviewBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [touched, setTouched] = useState<{ name?: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const savedTimerRef = useRef<number | null>(null);
  const uploadTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      if (uploadTimerRef.current) window.clearTimeout(uploadTimerRef.current);
    };
  }, []);

  const isNameValid = profile.name.trim().length >= 2;

  const isDirty =
    profile.name.trim() !== user.name ||
    profile.profileImage.trim() !== (user.profileImage ?? "");

  const canSaveProfile = isDirty && isNameValid && !savingProfile && !uploading;

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
    if (!canSaveProfile) return;
    setSavingProfile(true);
    setError(null);
    try {
      await axiosInstance.patch("/api/users/me", {
        name: profile.name.trim(),
        profileImage: profile.profileImage.trim(),
      });

      await refreshUser();

      setSavedProfileAt(Date.now());
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(
        () => setSavedProfileAt(null),
        2400,
      );
    } catch (err) {
      setError(extractError(err, "Failed to save your profile"));
    } finally {
      setSavingProfile(false);
    }
  };

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
          Manage your personal details and profile image.
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
              {user.email}
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
                  value={user.email}
                  disabled
                  className="flex h-12 w-full cursor-not-allowed rounded-2xl border border-border bg-secondary/50 px-4 text-base text-muted-foreground outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Email cannot be changed here.
                </p>
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
                    JPG, PNG, or WebP. Maximum 5 MB.
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
                      email: user.email,
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

          {!isEmailAccount && (
            <motion.section
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5 sm:px-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500">
                  <Shield className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Password managed by {user.provider}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your password through that provider.
                  </p>
                </div>
              </div>
            </motion.section>
          )}
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
            </ul>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <ProfileForm key={user.id} user={user} />;
}
