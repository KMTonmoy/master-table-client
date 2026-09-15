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

const Testimonials = () => {
  return (
    <section className="section border-t border-border/70">
      <div className="content-wrap px-5">
        <h2>What guests keep telling us</h2>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6"
            >
              <blockquote className="flex-1 text-[15px] leading-relaxed text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.detail}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;