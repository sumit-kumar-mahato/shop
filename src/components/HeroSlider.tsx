"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  link: string;
  image: string;
}

interface HeroSliderProps {
  banners: Banner[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  return (
    <div className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden bg-zinc-950">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-linear scale-105"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.2)), url(${banner.image})`,
              transform: index === current ? "scale(1)" : "scale(1.05)",
            }}
          />

          {/* Banner Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
              <div className="max-w-xl space-y-6">
                <span className="inline-block text-xs font-bold tracking-widest text-luxury-gold uppercase border-b-2 border-luxury-gold pb-1 animate-fade-in">
                  {banner.subtitle}
                </span>
                <h1 className="serif-header text-4xl sm:text-6xl font-normal leading-tight tracking-tight uppercase drop-shadow-md animate-fade-in-up">
                  {banner.title}
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-lg drop-shadow">
                  {banner.description}
                </p>
                <div className="pt-4">
                  <Link
                    href={banner.link}
                    className="inline-block bg-white text-zinc-950 hover:bg-luxury-gold hover:text-zinc-950 text-xs font-bold tracking-widest px-8 py-4 rounded-sm transition-all duration-300 transform active:scale-95 shadow-md"
                  >
                    {banner.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/30 hover:bg-luxury-gold hover:text-zinc-950 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
            title="Previous Banner"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/30 hover:bg-luxury-gold hover:text-zinc-950 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
            title="Next Banner"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current ? "bg-luxury-gold w-6" : "bg-white/40"
              }`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
