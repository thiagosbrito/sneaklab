import Hero from "@/components/layout/Hero";
import BrandsSlider from "@/components/layout/BrandsSlider";
import BestSeller from "@/components/layout/BestSeller";
import SubscribeNewsletter from "@/components/layout/SubscribeNewsletter";
import Showcase from "@/components/layout/Showcase";

const HomePage = () => {
  return (
    <div className="w-screen bg-gradient-to-b from-background to-foreground text-foreground">
        <Hero />
        <Showcase />
        <BrandsSlider />
        <BestSeller />
        <SubscribeNewsletter />
    </div>
  );
};

export default HomePage;
