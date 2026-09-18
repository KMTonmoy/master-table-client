import Image from "next/image";

const STATS = [
  { label: "In business since", value: "1985" },
  { label: "Recipes on the menu", value: "60+" },
  { label: "Cities we cook in", value: "4" },
];

const About = () => {
  return (
    <section className="section">
      <div className="content-wrap grid grid-cols-1 items-center gap-10 px-5 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-border">
          <Image
            src="https://www.escoffier.edu/wp-content/uploads/2021/08/Confident-smiling-female-chef-holding-two-plates-cooked-food-in-kitchen.jpeg"
            alt="Chef tending to a wood-fired tandoor oven in the kitchen"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-[52ch]">
          <h2>A kitchen that never rushes a curry</h2>
          <p className="mt-4 text-muted-foreground">
            Master Table began as a single tandoor oven in a Lucknow courtyard.
            Three generations later, the recipes haven&apos;t changed &mdash;
            just the number of tables we set. Every spice is ground fresh each
            morning, every gravy is built the slow way, and every dish leaves
            the kitchen the way it would have left our grandmother&apos;s.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-2xl font-semibold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;