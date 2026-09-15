import Link from "next/link";
import { Button } from "@/components/ui/button";

const ReservationCTA = () => {
  return (
    <section className="section">
      <div className="content-wrap px-5">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-foreground px-6 py-10 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[42ch]">
            <h2 className="!text-background">
              Save a table for tonight
            </h2>
            <p className="mt-3 text-background/70">
              Walk-ins are welcome, but a reservation means your table&apos;s
              ready the moment you are.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              className="btn-primary h-12 px-8 text-base"
              render={<Link href="/reservations" />}
            >
              Reserve a Table
            </Button>
            <Button
              variant="outline"
              className="h-12 border-background/30 bg-transparent px-8 text-base text-background hover:bg-background/10 hover:text-background"
              render={<Link href="/menu" />}
            >
              Order Online
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReservationCTA;