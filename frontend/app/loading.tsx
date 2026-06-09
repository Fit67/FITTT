export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated brand mark */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
          <span className="font-display text-lg font-bold text-primary-600 dark:text-primary-400">Z</span>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading…</p>
      </div>
    </div>
  )
}
