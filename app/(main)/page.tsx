import Hero from "@/components/layout/Hero";
import BrandsSlider from "@/components/layout/BrandsSlider";
import BestSeller from "@/components/layout/BestSeller";
import SubscribeNewsletter from "@/components/layout/SubscribeNewsletter";
import Showcase from "@/components/layout/Showcase";
import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const HomePage = async () => {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select();
  if (categories) {
    console.log("Fetched categories:", categories);
  }

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
