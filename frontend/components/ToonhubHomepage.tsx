"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from './Footer';
import { Navbar } from '@/components/layout/Navbar';

const IMAGES = [
  {
    src: '/images/product-1.png',
    bg: '#DC2626',
    panel: '#991B1B',
    name: 'RED REX',
    tagline: 'BIG WHEY',
    accent: '#FCA5A5',
    itemScale: 1.05,
    slug: 'red-rex-premium-protein',
  },
  {
    src: '/images/product-2.png',
    bg: '#2563EB',
    panel: '#EFF6FF',
    name: 'MUSCLE ADD',
    tagline: 'WHEY ADD',
    accent: '#93C5FD',
    itemScale: 1.05,
    slug: 'muscle-add-whey',
  },
  {
    src: '/images/product-3.png',
    bg: '#18181B',
    panel: '#3F3F46',
    name: 'OPTIMUM NUTRITION',
    tagline: 'GOLD STANDARD',
    accent: '#FBBF24',
    itemScale: 1.05,
    slug: 'on-gold-standard-whey',
  },
];

const grainDataUri = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

export function ToonhubHomepage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDiscoverHovered, setIsDiscoverHovered] = useState(false);

  const animatingRef = useRef(false);
  const touchStartX = useRef(0);

  // Preload all IMAGES on mount
  useEffect(() => {
    IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation Logic
  const navigate = (direction: 'next' | 'prev') => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsAnimating(true);
    
    const len = IMAGES.length;

    setActiveIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % len;
      } else {
        return (prev + (len - 1)) % len;
      }
    });

    setTimeout(() => {
      animatingRef.current = false;
      setIsAnimating(false);
    }, 650);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        navigate('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        navigate('prev');
      } else {
        navigate('next');
      }
    }
  };

  // Get style properties for each carousel item based on its current role
  const getRoleStyles = (role: 'center' | 'left' | 'right' | 'back', isMob: boolean, itemScale: number) => {
    switch (role) {
      case 'center':
        return {
          transform: `translateX(-50%) scale(${itemScale})`,
          filter: 'none',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMob ? '70%' : '82%',
          bottom: '10px',
        };
      case 'left':
        return {
          transform: `translateX(-50%) scale(${itemScale * 0.75})`,
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMob ? '20%' : '22%',
          height: isMob ? '40%' : '55%',
          bottom: isMob ? '20px' : '40px',
        };
      case 'right':
        return {
          transform: `translateX(-50%) scale(${itemScale * 0.75})`,
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMob ? '80%' : '78%',
          height: isMob ? '40%' : '55%',
          bottom: isMob ? '20px' : '40px',
        };
      case 'back':
        return {
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(4px)',
          opacity: 1,
          zIndex: 5,
          left: '50%',
          height: isMob ? '13%' : '22%',
          bottom: isMob ? '32%' : '12%',
        };
    }
  };

  const activeItem = IMAGES[activeIndex];

  return (
    <div
      id="toonhub-root"
      className="relative w-full min-h-screen flex flex-col font-sans select-none overflow-x-hidden"
      style={{
        backgroundColor: activeItem.bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        id="toonhub-viewport"
        className="relative w-full h-screen shrink-0 overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >


        {/* Showroom/pedestal floor using the panel color */}
        <div
          id="showroom-floor"
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none filter blur-[4px] opacity-75"
          style={{
            backgroundColor: activeItem.panel,
            width: isMobile ? '160%' : '110%',
            height: isMobile ? '22%' : '38%',
            bottom: isMobile ? '-10%' : '-18%',
            zIndex: 1,
            transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1), width 650ms, height 650ms, bottom 650ms',
          }}
        />

        {/* 2. Giant ghost text "3D SHAPE" -> changed to DOCTORFIT */}
        <div
          id="giant-ghost-text"
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none text-white font-anton uppercase whitespace-nowrap"
          style={{
            top: '18%',
            zIndex: 2,
            fontSize: 'clamp(90px, 20vw, 380px)',
            fontWeight: 900,
            opacity: 0.25, // Adjusted opacity for a cleaner ghost effect
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="text-black">DOCTOR</span><span className="text-white">FIT</span>
        </div>

        {/* Global Glass Navbar */}
        <Navbar />

        {/* 4. Carousel */}
        <div id="carousel-container" className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((item, i) => {
            let role: 'center' | 'left' | 'right' | 'back';
            const len = IMAGES.length;
            
            if (i === activeIndex) {
              role = 'center';
            } else if (i === (activeIndex + (len - 1)) % len) {
              role = 'left';
            } else if (i === (activeIndex + 1) % len) {
              role = 'right';
            } else {
              role = 'back';
            }

            const roleStyle = getRoleStyles(role, isMobile, item.itemScale);

            return (
              <div
                key={i}
                id={`carousel-item-${i}`}
                style={{
                  position: 'absolute',
                  aspectRatio: '1.5 / 1',
                  transformOrigin: 'bottom center',
                  transform: roleStyle.transform,
                  filter: roleStyle.filter,
                  opacity: roleStyle.opacity,
                  zIndex: roleStyle.zIndex,
                  left: roleStyle.left,
                  height: roleStyle.height,
                  bottom: roleStyle.bottom,
                  transition: 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1), bottom 650ms cubic-bezier(0.4, 0, 0.2, 1), height 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform, opacity, left, bottom, height',
                }}
                className={`select-none ${role === 'center' ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer group'}`}
                onClick={(e) => {
                  if (!isAnimating && role !== 'center') {
                    e.stopPropagation();
                    if (role === 'left') {
                      navigate('prev');
                    } else if (role === 'right') {
                      navigate('next');
                    }
                  }
                }}
              >
                {/* Figurine Image */}
                <img
                  id={`carousel-img-${i}`}
                  src={item.src}
                  alt={item.name}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain object-bottom select-none sm:drop-shadow-[0_30px_50px_rgba(0,0,0,0.3)] transition-transform ${role !== 'center' ? 'group-hover:brightness-110 group-hover:scale-[1.02]' : ''}`}
                />
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-left text + nav buttons */}
        <div
          id="content-controls-container"
          className="absolute bottom-24 left-4 sm:bottom-20 sm:left-24 flex flex-col items-start select-none bg-black/15 backdrop-blur-md p-4 rounded-2xl sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:rounded-none"
          style={{ zIndex: 60, maxWidth: '480px' }}
        >
          {/* Active Figurine Custom Name Tag */}
          <div className="overflow-hidden mb-1">
            <h2
              id="active-character-name"
              className="text-xs font-bold tracking-[0.25em] uppercase transition-all duration-500"
              style={{
                color: activeItem.accent,
                transform: isAnimating ? 'translateY(100%)' : 'translateY(0%)',
                opacity: isAnimating ? 0 : 0.9,
              }}
            >
              {activeItem.name}
            </h2>
          </div>

          <p
            id="toonhub-figurines-title"
            className="text-white font-bold uppercase mb-2 sm:mb-3 text-base sm:text-[22px]"
            style={{
              letterSpacing: '0.02em',
              opacity: 0.95,
            }}
          >
            PREMIUM PROTEIN
          </p>

          <p
            id="carousel-description"
            className="hidden sm:block text-xs sm:text-sm text-white mb-4 sm:mb-5 transition-all duration-500"
            style={{
              lineHeight: 1.6,
              opacity: isAnimating ? 0.4 : 0.85,
            }}
          >
            The highest quality protein formula designed for maximum muscle recovery and growth. Order now to elevate your fitness journey.
          </p>

          {/* Navigation Buttons */}
          <div id="nav-buttons-group" className="flex items-center gap-4">
            <button
              id="nav-prev-btn"
              onClick={() => navigate('prev')}
              disabled={isAnimating}
              className="group flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent text-white transition-all duration-150 hover:scale-105 hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous character"
            >
              <ArrowLeft
                id="prev-btn-icon"
                className="transition-transform group-hover:-translate-x-1"
                size={26}
                strokeWidth={2.25}
              />
            </button>
            <button
              id="nav-next-btn"
              onClick={() => navigate('next')}
              disabled={isAnimating}
              className="group flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent text-white transition-all duration-150 hover:scale-105 hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next character"
            >
              <ArrowRight
                id="next-btn-icon"
                className="transition-transform group-hover:translate-x-1"
                size={26}
                strokeWidth={2.25}
              />
            </button>
          </div>
        </div>

        {/* 6. Discover Label / Shop Now - Interactive */}
        <Link
          id="discover-link"
          href="/shop/products"
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center gap-1 sm:gap-3 text-white no-underline transition-all duration-200 select-none font-anton"
          style={{
            zIndex: 60,
            fontSize: isMobile ? '24px' : 'clamp(32px, 4vw, 56px)',
            fontWeight: 400,
            opacity: isDiscoverHovered ? 1 : 0.95,
            letterSpacing: '-0.02em',
            lineHeight: '1',
          }}
          onMouseEnter={() => setIsDiscoverHovered(true)}
          onMouseLeave={() => setIsDiscoverHovered(false)}
        >
          <span>SHOP NOW</span>
          <ArrowRight
            id="discover-arrow"
            className="transition-transform duration-300"
            style={{
              width: isMobile ? '24px' : '32px',
              height: isMobile ? '24px' : '32px',
              transform: isDiscoverHovered ? 'translateX(6px)' : 'translateX(0px)',
            }}
            strokeWidth={2.25}
          />
        </Link>

        {/* 7. Floating View Details Button */}
        <Link
          href={`/shop/products/${activeItem.slug}`}
          className="absolute z-[60] flex items-center justify-center bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.25)]"
          style={{
            // On desktop: Left side of the jar. On mobile: Upper-left side of the jar.
            left: isMobile ? '4%' : '32%',
            top: isMobile ? '42%' : '50%',
            bottom: 'auto',
            transform: isMobile ? 'translateY(-50%) scale(0.85)' : 'translateY(-50%) scale(1)',
            opacity: isAnimating ? 0 : 1,
            pointerEvents: isAnimating ? 'none' : 'auto',
            padding: isMobile ? '10px 20px' : '16px 32px',
            fontSize: isMobile ? '12px' : '14px',
          }}
        >
          View Details
        </Link>

        {/* Custom Progress Indicators */}
        <div
          id="slide-indicators"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
          style={{ zIndex: 60 }}
        >
          {IMAGES.map((_, idx) => (
            <button
              key={idx}
              id={`slide-dot-${idx}`}
              onClick={() => {
                if (isAnimating || idx === activeIndex) return;
                setIsAnimating(true);
                setActiveIndex(idx);
                setTimeout(() => setIsAnimating(false), 650);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to item ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <Footer activeColor={activeItem.bg} />
    </div>
  );
}
