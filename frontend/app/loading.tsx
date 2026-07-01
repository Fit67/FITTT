/**
 * loading.tsx — Full-page loading screen (Next.js Suspense boundary)
 *
 * Shown when navigating to a page that hasn't loaded yet.
 * Designed to feel like a premium branded moment, not a blank screen.
 */

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
      {/* Subtle crimson ambient glow */}
      <div
        className="absolute rounded-full blur-[120px] opacity-15 dark:opacity-20 pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, #B91C1C, transparent 70%)',
          animation: 'customPulse 4s ease-in-out infinite',
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Brand Logo */}
        <div 
          className="flex flex-col items-center"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <span className="font-display font-black text-4xl sm:text-5xl tracking-tight text-black dark:text-white drop-shadow-sm">
            DOCTOR <span className="text-[#B91C1C]">FIT</span>
          </span>
        </div>

        {/* Smooth minimal progress track */}
        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 shadow-inner">
          <div 
            className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-[#B91C1C]"
            style={{ animation: 'sweep 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes customPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
      `}} />
    </div>
  )
}
