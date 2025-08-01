'use client';
import { useEffect, useState } from "react";
import { HeroSection } from '@/db/schema';
import { LoaderCircle } from "lucide-react";

export default function Hero() {
    const [heroData, setHeroData] = useState<HeroSection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroSection = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/content/hero');
                if (response.ok) {
                    const data = await response.json();
                    setHeroData(data);
                } else {
                    console.error("Error fetching hero section:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching hero section:", error);
            }
            setLoading(false);
        };

        fetchHeroSection();
    }, []);

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
                style={{ backgroundImage: `url(${heroData.backgroundImageUrl})` }}
            >
                <div className="max-w-3xl px-4 text-center">
                    <h1 className="text-4xl font-bold text-shadow-sm">{heroData.heroTitle}</h1>
                    <p className="mt-4 text-lg">{heroData.heroSubtitle}</p>
                    <div className="mt-8">
                        <a
                            href={heroData.ctaRedirectTo}
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            {heroData.ctaText}
                        </a>
                    </div>
                </div>
            </div>
        )
    );
}