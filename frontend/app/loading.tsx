/**
 * loading.tsx — Full-page loading screen (Next.js Suspense boundary)
 *
 * Shown when navigating to a page that hasn't loaded yet.
 * Designed to feel like a premium branded moment, not a blank screen.
 */

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      {/* Ambient glow behind loader */}
      <div
        className="absolute rounded-full blur-[80px] opacity-20 dark:opacity-15 pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgb(251,191,36), rgb(217,119,6), transparent)',
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        {/* Spinner */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Outer track */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-gray-800" />

          {/* Spinning arc — gold */}
          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent"
            style={{
              borderTopColor: 'rgb(217,119,6)',
              borderRightColor: 'rgba(245,158,11,0.4)',
              animation: 'spin 0.8s cubic-bezier(0.4, 0.0, 0.6, 1.0) infinite',
            }}
          />

          {/* Inner pulse ring */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.15), transparent)',
              animation: 'pulse 1.4s ease-in-out infinite',
            }}
          />

          {/* Brand letter */}
          <span className="relative font-display text-lg font-bold text-primary-600 dark:text-primary-400 select-none">
            {/* Replace with your store's initial */}
            ✦
          </span>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-1.5 w-1.5 rounded-full bg-primary-400/60 dark:bg-primary-500/50"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
