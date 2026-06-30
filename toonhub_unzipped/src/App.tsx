/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const IMAGES = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
    panel: '#F79B7F',
    name: 'AMBER SPARK',
    tagline: 'COLLECTION #01',
    accent: '#FFE5B4',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
    panel: '#85CC92',
    name: 'SAGE MECH',
    tagline: 'COLLECTION #02',
    accent: '#E2F0D9',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
    panel: '#ED9DC4',
    name: 'BLOSSOM BOT',
    tagline: 'COLLECTION #03',
    accent: '#FADBD8',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
    name: 'COBALT GLIDE',
    tagline: 'COLLECTION #04',
    accent: '#EBF5FB',
  },
];

const grainDataUri = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDiscoverHovered, setIsDiscoverHovered] = useState(false);

  const animatingRef = useRef(false);
  const touchStartX = useRef(0);

  // Preload all 4 images on mount
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

    setActiveIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % 4;
      } else {
        return (prev + 3) % 4;
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
  const getRoleStyles = (role: 'center' | 'left' | 'right' | 'back', isMob: boolean) => {
    switch (role) {
      case 'center':
        return {
          transform: `translateX(-50%) scale(${isMob ? 1.25 : 1.68})`,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMob ? '60%' : '92%',
          bottom: isMob ? '22%' : '0px',
        };
      case 'left':
        return {
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMob ? '20%' : '30%',
          height: isMob ? '16%' : '28%',
          bottom: isMob ? '32%' : '12%',
        };
      case 'right':
        return {
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMob ? '80%' : '70%',
          height: isMob ? '16%' : '28%',
          bottom: isMob ? '32%' : '12%',
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
      className="relative w-full overflow-hidden font-sans select-none"
      style={{
        backgroundColor: activeItem.bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        id="toonhub-viewport"
        className="relative w-full h-screen overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 1. Grain overlay */}
        <div
          id="grain-overlay"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${grainDataUri}")`,
            opacity: 0.4,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            zIndex: 50,
          }}
        />

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

        {/* 2. Giant ghost text "3D SHAPE" */}
        <div
          id="giant-ghost-text"
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none text-white font-anton uppercase whitespace-nowrap"
          style={{
            top: '18%',
            zIndex: 2,
            fontSize: 'clamp(90px, 28vw, 380px)',
            fontWeight: 900,
            opacity: 1,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          3D SHAPE
        </div>

        {/* 3. Top-left brand label "TOONHUB" */}
        <div
          id="brand-label"
          className="absolute top-6 left-4 sm:left-8 text-white uppercase text-xs font-semibold select-none"
          style={{
            zIndex: 60,
            opacity: 0.9,
            letterSpacing: '0.18em',
          }}
        >
          TOONHUB
        </div>

        {/* Interactive Tagline / Active Index Display in Top Right */}
        <div
          id="active-index-display"
          className="absolute top-6 right-4 sm:right-8 flex items-center gap-3 text-white text-xs font-semibold select-none"
          style={{ zIndex: 60, opacity: 0.9 }}
        >
          <span className="tracking-[0.1em]">{activeItem.tagline}</span>
          <div className="w-12 h-[1px] bg-white/40 relative">
            <div
              className="absolute h-full bg-white transition-all duration-650"
              style={{
                left: 0,
                width: `${((activeIndex + 1) / 4) * 100}%`,
              }}
            />
          </div>
          <span className="font-mono text-[11px] opacity-75">0{activeIndex + 1} / 04</span>
        </div>

        {/* 4. Carousel */}
        <div id="carousel-container" className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((item, i) => {
            let role: 'center' | 'left' | 'right' | 'back';
            if (i === activeIndex) {
              role = 'center';
            } else if (i === (activeIndex + 3) % 4) {
              role = 'left';
            } else if (i === (activeIndex + 1) % 4) {
              role = 'right';
            } else {
              role = 'back';
            }

            const roleStyle = getRoleStyles(role, isMobile);

            return (
              <div
                key={i}
                id={`carousel-item-${i}`}
                style={{
                  position: 'absolute',
                  aspectRatio: '0.6 / 1',
                  transform: roleStyle.transform,
                  filter: roleStyle.filter,
                  opacity: roleStyle.opacity,
                  zIndex: roleStyle.zIndex,
                  left: roleStyle.left,
                  height: roleStyle.height,
                  bottom: roleStyle.bottom,
                  transition: 'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), filter 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 650ms cubic-bezier(0.4, 0, 0.2, 1), left 650ms cubic-bezier(0.4, 0, 0.2, 1), bottom 650ms cubic-bezier(0.4, 0, 0.2, 1), height 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform, filter, opacity',
                }}
                className={`select-none cursor-pointer ${role === 'center' ? 'cursor-default' : 'hover:brightness-110'}`}
                onClick={() => {
                  if (role !== 'center' && !isAnimating) {
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
                  className="w-full h-full object-contain object-bottom select-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.18)]"
                />
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-left text + nav buttons */}
        <div
          id="content-controls-container"
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24 flex flex-col items-start select-none"
          style={{ zIndex: 60, maxWidth: '320px' }}
        >
          {/* Active Figurine Custom Name Tag */}
          <div className="overflow-hidden mb-1">
            <h2
              id="active-character-name"
              className="text-white text-xs font-bold tracking-[0.25em] uppercase transition-all duration-500"
              style={{
                transform: isAnimating ? 'translateY(100%)' : 'translateY(0%)',
                opacity: isAnimating ? 0 : 0.75,
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
            TOONHUB FIGURINES
          </p>

          <p
            id="carousel-description"
            className="hidden sm:block text-xs sm:text-sm text-white mb-4 sm:mb-5 transition-all duration-500"
            style={{
              lineHeight: 1.6,
              opacity: isAnimating ? 0.4 : 0.85,
            }}
          >
            The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.
          </p>

          {/* Navigation Buttons */}
          <div id="nav-buttons-group" className="flex items-center gap-4">
            <button
              id="nav-prev-btn"
              onClick={() => navigate('prev')}
              disabled={isAnimating}
              className="group flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent text-white transition-all duration-150 hover:scale-108 hover:bg-white/12 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="group flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent text-white transition-all duration-150 hover:scale-108 hover:bg-white/12 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* 6. Bottom-right link "DISCOVER IT" */}
        <a
          id="discover-link"
          href="#discover"
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center gap-1 sm:gap-3 text-white no-underline transition-all duration-200 select-none font-anton"
          style={{
            zIndex: 60,
            fontSize: 'clamp(20px, 4vw, 56px)',
            fontWeight: 400,
            opacity: isDiscoverHovered ? 1 : 0.95,
            letterSpacing: '-0.02em',
            lineHeight: '1',
          }}
          onMouseEnter={() => setIsDiscoverHovered(true)}
          onMouseLeave={() => setIsDiscoverHovered(false)}
        >
          <span>DISCOVER IT</span>
          <ArrowRight
            id="discover-arrow"
            className="transition-transform duration-300"
            style={{
              width: isMobile ? '20px' : '32px',
              height: isMobile ? '20px' : '32px',
              transform: isDiscoverHovered ? 'translateX(6px)' : 'translateX(0px)',
            }}
            strokeWidth={2.25}
          />
        </a>

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
    </div>
  );
}
