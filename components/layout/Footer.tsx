import Link from "next/link";
 import { Button } from "@/components/ui/button";
import { FaFacebook, FaInstagram, FaInstagramSquare } from "react-icons/fa";

const EXPLORE_LINKS = [
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Reservations", href: "/reservations" },
  { label: "Contact", href: "/contact" },
];

const HOURS = [
  { day: "Mon &ndash; Thu", time: "12pm &ndash; 10pm" },
  { day: "Fri &ndash; Sat", time: "12pm &ndash; 11pm" },
  { day: "Sun", time: "1pm &ndash; 9pm" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="content-wrap grid grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20"
            />
            <span className="font-heading text-xl font-bold text-foreground">
              Master Table
            </span>
          </Link>
          <p className="mt-3 max-w-[32ch] text-sm text-muted-foreground">
            Family recipes, wood-fired since 1985.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              href="https://instagram.com"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-foreground"
            >
              <FaInstagramSquare  className="h-5 w-5" />
            </Link>
            <Link
              href="https://facebook.com"
              aria-label="Facebook"
              className="text-muted-foreground hover:text-foreground"
            >
              <FaFacebook className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h3>Explore</h3>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Hours</h3>
          <ul className="mt-4 space-y-2.5">
            {HOURS.map((row) => (
              <li
                key={row.day}
                className="flex justify-between gap-4 text-sm text-muted-foreground"
              >
                <span dangerouslySetInnerHTML={{ __html: row.day }} />
                <span dangerouslySetInnerHTML={{ __html: row.time }} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Get our newsletter</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            New seasonal dishes and the odd invitation to a tasting menu.
          </p>
          <form className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="Email address"
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button className="h-11 shrink-0 px-5" type="submit">
              Sign up
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="content-wrap flex flex-col-reverse items-center gap-3 px-5 py-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Master Table. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;