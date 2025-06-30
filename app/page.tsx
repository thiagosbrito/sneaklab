import { ThemeProvider } from "next-themes";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/layout/Hero";
import FeaturedSneakers from "@/components/layout/FeaturedSneakers";
import BrandsSlider from "@/components/layout/BrandsSlider";

const HomePage = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-background to-foreground text-foreground">
        <Hero />
        <BrandsSlider />
        <FeaturedSneakers />
    </div>
  );
};

export default HomePage;
