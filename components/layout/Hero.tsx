'use client';
import { LoaderCircle } from "lucide-react";
import { useHeroSectionState } from '@/hooks/queries/useContent';
import AnimatedView from "../animations/AnimatedView";
import * as shoesLoader from '../animations/shoes-loader/shoes-loader.json';

export default function Hero() {
    const { heroData, loading, error } = useHeroSectionState();

    if (loading) {
        return (
            <div className="flex flex-col items-center gap-y-2 justify-center h-[850px] text-white bg-gray-900">
                <AnimatedView
                    animationData={shoesLoader}
                    height={128}
                    width={128}
                />
                <span className="ml-4 text-gray-400">Loading hero content...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-y-2 justify-center h-[850px] text-white bg-gray-900">
                <span className="text-red-400">Failed to load hero content</span>
                <span className="text-gray-400 text-sm">{error}</span>
            </div>
        );
    }

    if (!heroData) {
        return (
            <div className="flex flex-col items-center gap-y-2 justify-center h-[850px] text-white bg-gray-900">
                <span className="text-gray-400">No hero content available</span>
            </div>
        );
    }

    return (
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
    );
}