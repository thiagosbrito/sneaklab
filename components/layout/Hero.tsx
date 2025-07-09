'use client';
import { Suspense } from "react";
import useSupabaseBrowser from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/utils/supabase/database.types";

export default function Hero() {
    const [heroData, setHeroData] = useState<Database["public"]["Tables"]["hero_section"]["Row"] | null>(null);
    const supabase = useSupabaseBrowser();

    useEffect(() => {
        const fetchHeroSection = async () => {
            const { data, error } = await supabase.from("hero_section").select("*").single();
            if (error) {
                console.error("Error fetching hero section:", error.message);
            } else {
                setHeroData(data);
            }
        };

        fetchHeroSection();
    }, [supabase]);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[850px] text-white">Loading...</div>}>
            {heroData && (
                <div
                    className="flex flex-col items-center justify-center h-[850px] bg-cover bg-center text-white w-full"
                    style={{ backgroundImage: `url(${heroData.background_image_url})` }}
                >
                    <div className="max-w-3xl px-4 text-center">
                        <h1 className="text-4xl font-bold text-shadow-sm">{heroData.hero_title}</h1>
                        <p className="mt-4 text-lg">{heroData.hero_subtitle}</p>
                        <div className="mt-8">
                            <a
                                href={heroData.cta_redirect_to}
                                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                                {heroData.cta_text}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </Suspense>
    );
}