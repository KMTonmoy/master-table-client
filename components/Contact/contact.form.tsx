"use client";

import {
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS, type ContactForm } from "@/types/contact.types";

type Props = {
  form: ContactForm;
  update: <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  canSubmit: boolean;
  submitting: boolean;
};

const InputField = ({
  id,
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <label htmlFor={id} className="flex flex-col gap-2">
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
      {required && <span className="ml-1 text-primary">*</span>}
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
        required={required}
        className="
          h-12 w-full rounded-2xl border border-white/60 bg-white/15 pl-11 pr-4 text-sm text-foreground
          placeholder:text-muted-foreground/70 backdrop-blur-md backdrop-saturate-150
          transition-all duration-300
          focus:border-primary/50 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-primary/30
          dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10
        "
      />
    </div>
  </label>
);

const ContactFormComponent = ({
  form,
  update,
  onSubmit,
  canSubmit,
  submitting,
}: Props) => {
  return (
    <form onSubmit={onSubmit} className="relative lg:col-span-3">
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-6 shadow-[0_25px_70px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8 dark:border-white/10 dark:bg-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] ring-1 ring-inset ring-white/40"
        />

        <div className="relative space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We usually reply within a few hours during opening times.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              id="name"
              label="Full name"
              icon={<User className="h-4 w-4" />}
              value={form.name}
              onChange={(v) => update("name", v)}
              placeholder="Jane Doe"
              required
            />
            <InputField
              id="phone"
              label="Phone"
              icon={<Phone className="h-4 w-4" />}
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="+1 555 000 1234"
            />
            <div className="sm:col-span-2">
              <InputField
                id="email"
                label="Email"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                placeholder="jane@example.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Subject
            </span>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update("subject", s.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                    form.subject === s.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-white/60 bg-white/20 text-foreground hover:bg-white/35 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Message
              <span className="text-primary">*</span>
            </span>
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={6}
              placeholder="Tell us what's on your mind…"
              required
              className="
                w-full resize-none rounded-2xl border border-white/60 bg-white/15 p-4 text-sm text-foreground
                placeholder:text-muted-foreground/70 backdrop-blur-md backdrop-saturate-150
                transition-all duration-300
                focus:border-primary/50 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-primary/30
                dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10
              "
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={cn(
              "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              canSubmit && !submitting
                ? "bg-primary text-primary-foreground shadow-[0_12px_32px_-12px_rgba(224,165,38,0.6)] hover:scale-[1.01] hover:bg-primary/90 hover:shadow-[0_16px_36px_-12px_rgba(224,165,38,0.7)] active:scale-[0.99]"
                : "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
            )}
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Sending…
              </>
            ) : (
              <>
                Send message
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactFormComponent;