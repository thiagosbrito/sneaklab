import BestSeller from '@/components/layout/BestSeller';
import Showcase from '@/components/layout/Showcase';
import SubscribeNewsletter from '@/components/layout/SubscribeNewsletter';
import PageContainer from '@/components/ui/PageContainer';
import { getBrandsWithProductCount } from '@/utils/brands';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default async function MarcasPage() {
    const supabase = await createClient();
    const brands = await getBrandsWithProductCount(supabase);

    return (
        <>
            <PageContainer
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Marcas', current: true }
                ]}
                title="Nossas Marcas"
                description={`Descubra nossa seleção cuidadosamente curada de ${brands.length} marcas premium`}
                background="white"
            >
                {brands.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 text-lg">Nenhuma marca encontrada</p>
                        <p className="text-gray-400 mt-2">Volte em breve para ver nossas marcas!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="aspect-square p-8 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                                    {brand.logo ? (
                                        <Image
                                            src={brand.logo}
                                            alt={`${brand.name} logo`}
                                            width={120}
                                            height={120}
                                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                                        {brand.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {brand.product_count} {brand.product_count === 1 ? 'produto' : 'produtos'}
                                    </p>
                                    
                                    {brand.product_count > 0 && (
                                        <Link
                                            href={`/products?brand=${brand.id}`}
                                            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                        >
                                            Ver produtos
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PageContainer>
            
            <Showcase />
            <BestSeller />
            <SubscribeNewsletter />
        </>
    );
}
