"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT_INFO } from "@/types/contact.types";

const ContactInfo = () => {
  return (
    <aside className="lg:col-span-2">
      <div className="sticky top-24 space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-6 shadow-[0_25px_70px_-30px_rgba(74,46,32,0.4)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-2xl"
          />

          <h3 className="relative font-heading text-lg font-semibold text-foreground">
            Visit us
          </h3>

          <ul className="relative mt-4 space-y-4">
            <li className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Address
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {CONTACT_INFO.address.line1}
                </p>
                <p className="text-sm text-muted-foreground">
                  {CONTACT_INFO.address.line2}
                </p>
                <p className="text-sm text-muted-foreground">
                  {CONTACT_INFO.address.city}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </p>
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, "")}`}
                  className="mt-0.5 block text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="mt-0.5 block text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/15 p-6 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Opening hours
            </h3>
          </div>
          <ul className="mt-4 space-y-2.5">
            {CONTACT_INFO.hours.map((h) => (
              <li
                key={h.day}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{h.day}</span>
                <span className="font-medium text-foreground">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/70 bg-white/15 shadow-[0_20px_55px_-25px_rgba(74,46,32,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <iframe
            title="Master Table location"
            src={CONTACT_INFO.mapEmbed}
            className="h-full w-full border-0"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/40 bg-black/40 p-3 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Master Table
            </p>
            <p className="mt-0.5 text-xs text-white/90">
              {CONTACT_INFO.address.line1} · {CONTACT_INFO.address.line2}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ContactInfo;