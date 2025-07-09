'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import useSupabaseBrowser from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";

export default function Showcase() {
  const [showcaseData, setShowcaseData] = useState<Database["public"]["Tables"]["showcase_section"]["Row"] | null>(null);
  const supabase = useSupabaseBrowser();

  useEffect(() => {
    const fetchShowcaseSection = async () => {
      const { data, error } = await supabase.from("showcase_section").select("*").single();
      if (error) {
        console.error("Error fetching showcase section:", error.message);
      } else {
        setShowcaseData(data);
      }
    };

    fetchShowcaseSection();
  }, [supabase]);

  if (!showcaseData) {
    return <div>Loading...</div>;
  }

  return (
    <section className="w-full bg-gradient-to-r from-purple-400 to-purple-600 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {showcaseData.title} {/* Add your title here */}
              </h2>
              <p className="text-lg opacity-90 mb-8">
                {showcaseData.description} {/* Add your description here */}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">{showcaseData.subtitle_a} {/* Add your subtitleA here */}</h3>
                <p className="opacity-90">
                  {showcaseData.subtitle_description_a} {/* Add your subtitleDescriptionA here */}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">{showcaseData.subtitle_b} {/* Add your subtitleB here */}</h3>
                <p className="opacity-90">
                  {showcaseData.subtitle_description_b} {/* Add your subtitleDescriptionB here */}
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Image Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md aspect-square flex items-center justify-center">
              <Image
                src={showcaseData.image_url} /* Add your imageUrl here */
                alt="Showcase Image"
                width={320}
                height={240}
                className="rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}