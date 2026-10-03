"use client";

import { motion, type Variants } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  detail: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The dal makhani tastes like it's been on the stove all day, because it has. Best in the city, no contest.",
    name: "Amara Reyes",
    detail: "Regular since 2021",
  },
  {
    quote:
      "We booked the private room for my father's retirement dinner. The biryani alone was worth the trip.",
    name: "Devon Clarke",
    detail: "Reserved for a party of 12",
  },
  {
    quote:
      "Delivery still arrives hot, which says a lot about how seriously they take packaging and timing.",
    name: "Priya Nair",
    detail: "Orders weekly",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const headerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.94,
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE },
  },
};

const Testimonials = () => {
  return (
    <section className="section relative overflow-hidden border-t border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#E0A526]/12 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C78E1E]/12 blur-[120px]"
      />

      <div className="content-wrap relative px-5">
        <motion.div
          variants={headerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.4 }}
        >
          <motion.div
            variants={headerItem}
            className="mb-4 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-[#E0A526]" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E0A526] sm:text-xs">
              Guest Voices
            </span>
          </motion.div>

          <motion.h2
            variants={headerItem}
            className="text-3xl sm:text-4xl lg:text-5xl"
          >
            What guests{" "}
            <span className="relative inline-block text-primary">
              keep telling us
              <motion.span
                variants={{
                  hidden: { scaleX: 0 },
                  show: {
                    scaleX: 1,
                    transition: { duration: 1, ease: EASE, delay: 0.5 },
                  },
                }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#E0A526] to-[#C78E1E]"
              />
            </span>
          </motion.h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.figure
              key={testimonial.name}
              variants={cardReveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.35, ease: EASE } }}
              className="
                group relative flex h-full flex-col overflow-hidden rounded-2xl
                border border-border bg-card p-6
                shadow-[0_10px_40px_-20px_rgba(74,46,32,0.25)]
                transition-colors duration-500
                hover:border-[#E0A526]/40
              "
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#E0A526]/15 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#E0A526]/60 to-transparent"
              />

              <span
                aria-hidden
                className="pointer-events-none absolute right-5 top-3 font-heading text-5xl leading-none text-[#E0A526]/20 transition-colors duration-500 group-hover:text-[#E0A526]/40"
              >
                &rdquo;
              </span>

              <blockquote className="relative flex-1 text-[15px] leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <figcaption className="relative mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.detail}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;