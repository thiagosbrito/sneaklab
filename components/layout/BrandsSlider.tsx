'use client'
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const brandLogos = [
  'logos-marcas-Adidas-branco.webp',
  'logos-marcas-amari-branco.webp',
  'logos-marcas-balenciaga-branco.webp',
  'logos-marcas-corteiz-branco.webp',
  'logos-marcas-denim-tears-branco.webp',
  'logos-marcas-goyard-branco.webp',
  'logos-marcas-gucci-branco.webp',
  'logos-marcas-jordan-branco.webp',
  'logos-marcas-LV-branco.webp',
  'logos-marcas-NB-branco.webp',
  'logos-marcas-nike-branco.webp',
  'logos-marcas-off-white-branco.webp',
  'logos-marcas-sup-branco.webp',
  'logos-marcas-syna-branco.webp',
  'logos-marcas-trapstar-branco.webp',
];

export default function BrandsSlider() {
    // Only render the logos once, but visually duplicate them for seamless looping
    // We'll use two identical rows, and when the first is out of view, the second is in view
    const [rowWidth, setRowWidth] = useState(0);
    const rowRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();

    useEffect(() => {
        if (rowRef.current) {
            setRowWidth(rowRef.current.scrollWidth);
        }
    }, [brandLogos]);

    useEffect(() => {
        if (!rowWidth) return;
        const animate = async () => {
            while (true) {
                await controls.start({
                    x: -rowWidth,
                    transition: { duration: 30, ease: 'linear' },
                });
                controls.set({ x: 0 });
            }
        };
        animate();
    }, [rowWidth, controls]);

    return (
        <div className="overflow-hidden w-full py-4 bg-black space-y-6">
            <div className="container">
                <div className="flex flex-col gap-y-6">
                    <h1 className='text-4xl text-white font-extrabold tracking-wide leading-loose text-center'>About us</h1>
                    <p className='text-white text-center px-6 w-9/12 mx-auto'>
                        We don't just sell clothes, we curate a lifestyle. Discover the brands that define streetwear culture. From a passion for sneakers to a love for unique styles, our collection is a testament to the brands that inspire us. Whether you're looking for the latest drops or timeless classics, we have something for every streetwear enthusiast.
                    </p>
                </div>
            </div>
            <div className="w-12/12 container relative mx-auto flex items-center overflow-hidden">
                <div className="absolute w-20 right-0 h-full bg-gradient-to-l from-black to-transparent z-10"></div>
                <motion.div
                    className="flex items-center gap-x-6"
                    ref={rowRef}
                    animate={controls}
                    initial={{ x: 0 }}
                    style={{ minWidth: rowWidth ? rowWidth * 2 : '100%' }}
                >
                        {/* First row */}
                        {brandLogos.map((logo, idx) => (
                            <div key={`first-${idx}`}>
                                <Image
                                    src={`/brands/${logo}`}
                                    alt={logo.replace('logos-marcas-', '').replace('-branco.webp', '')}
                                    width={260}
                                    height={150}
                                    priority={idx < brandLogos.length}
                                />
                            </div>
                        ))}
                        {/* Second row (for seamless loop) */}
                        {brandLogos.map((logo, idx) => (
                            <div key={`second-${idx}`}>
                                <Image
                                    src={`/brands/${logo}`}
                                    alt={logo.replace('logos-marcas-', '').replace('-branco.webp', '')}
                                    width={260}
                                    height={150}
                                    priority={false}
                                />
                            </div>
                        ))}
                </motion.div>
                <div className="absolute w-20 left-0 h-full bg-gradient-to-r from-black to-transparent z-10"></div>
            </div>
        </div>
    );
}
