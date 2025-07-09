'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardSheet from '@/components/ui/DashboardSheet';
import ShowcaseSectionForm from '@/components/admin/content-management/ShowcaseSectionForm';
import useSupabaseBrowser from '@/utils/supabase/client';

export default function ShowcaseSectionPage() {
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    subtitleA: '',
    subtitleB: '',
    subtitleDescriptionA: '',
    subtitleDescriptionB: '',
    description: '',
  });
  const [hasContent, setHasContent] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const supabase = useSupabaseBrowser();

  useEffect(() => {
    const fetchShowcaseSection = async () => {
      const { data, error } = await supabase.from('showcase_section').select('*').single();

      if (error) {
        console.error('Error fetching showcase section:', error.message);
      } else if (data) {
        setFormData({
          imageUrl: data.image_url || '',
          title: data.title || '',
          subtitleA: data.subtitle_a || '',
          subtitleB: data.subtitle_b || '',
          subtitleDescriptionA: data.subtitle_description_a || '',
          subtitleDescriptionB: data.subtitle_description_b || '',
          description: data.description || '',
        });
        setHasContent(true);
      } else {
        setHasContent(false);
      }
    };

    fetchShowcaseSection();
  }, [supabase]);

  const handleSave = () => {
    setIsSheetOpen(false);
    setHasContent(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Showcase Section</h1>
      {hasContent ? (
        <section className="w-full bg-gradient-to-r from-purple-400 to-purple-600 py-16 px-4 sm:px-6 lg:px-8 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white space-y-8">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    {formData.title}
                  </h2>
                  <p className="text-lg opacity-90 mb-8">
                    {formData.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{formData.subtitleA}</h3>
                    <p className="opacity-90">
                      {formData.subtitleDescriptionA}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">{formData.subtitleB}</h3>
                    <p className="opacity-90">
                      {formData.subtitleDescriptionB}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Image Placeholder */}
              <div className="flex justify-center lg:justify-end">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md aspect-square flex items-center justify-center">
                  <img
                    src={formData.imageUrl}
                    alt="Showcase Image"
                    className="rounded-2xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">No content registered for the showcase section.</p>
        </div>
      )}
      <DashboardSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={hasContent ? 'Edit Showcase Section' : 'Add Showcase Section'}
        description={
          hasContent
            ? 'Update the content for the showcase section.'
            : 'Provide content for the showcase section.'
        }
        trigger={
          <Button onClick={() => setIsSheetOpen(true)}>
            {hasContent ? 'Edit Content' : 'Add Content'}
          </Button>
        }
        size={hasContent ? undefined : 'xl'}
      >
        <ShowcaseSectionForm initialData={hasContent ? formData : undefined} onSave={handleSave} />
      </DashboardSheet>
    </div>
  );
}
