import About from "@/components/Landing/About";
import Categories from "@/components/Landing/Categories";
import FeaturedDishes from "@/components/Landing/Featureddishes";
import Hero from "@/components/Landing/Hero";
import ReservationCTA from "@/components/Landing/Reservationcta";
import Testimonials from "@/components/Landing/Testimonials";
import Divider from "@/components/ui/Divider";
 export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <Divider />
      <Categories />
      <Divider />
      <FeaturedDishes />
      <Divider />
      <About />
      <Divider />
      <Testimonials />
      <Divider />
      <ReservationCTA />
    </main>
  );
}