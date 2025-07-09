'use client';
import { useEffect, useState } from "react";
import useSupabaseBrowser from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";
import { LoaderCircle } from "lucide-react";

export default function Hero() {
    const [heroData, setHeroData] = useState<Database["public"]["Tables"]["hero_section"]["Row"] | null>(null);
    const [loading, setLoading] = useState(true); // State to track loading status
    const supabase = useSupabaseBrowser();

    useEffect(() => {
        const fetchHeroSection = async () => {
            setLoading(true); // Start loading
            const { data, error } = await supabase.from("hero_section").select("*").single();
            if (error) {
                console.error("Error fetching hero section:", error.message);
            } else {
                setHeroData(data);
            }
            setLoading(false); // End loading
        };

        fetchHeroSection();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-y-2 justify-center h-[850px] text-white">
                <LoaderCircle className="animate-spin text-gray-600" size={48} />
                <span className="ml-4 text-gray-600">Loading...</span>
            </div>
        );
    }

    return (
        heroData && (
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
        )
    );
}