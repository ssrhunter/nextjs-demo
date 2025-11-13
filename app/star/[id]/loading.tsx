export default function StarDetailLoading() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-gradient-to-r from-indigo-600/50 to-indigo-800/50 text-slate-50 rounded-lg border border-indigo-500/30 shadow-lg shadow-indigo-500/20 animate-pulse">
          <div className="h-5 w-5 bg-slate-700/50 rounded" />
          <div className="h-5 w-28 bg-slate-700/50 rounded" />
        </div>

        {/* Large Photo Skeleton */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-2xl shadow-indigo-500/30 bg-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent animate-[shimmer_2s_infinite]" />
        </div>

        {/* Star Information Section Skeleton */}
        <article className="bg-gradient-to-br from-slate-900/80 to-indigo-950/80 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-8 shadow-lg shadow-indigo-500/20 animate-pulse">
          {/* Star Name Skeleton */}
          <div className="h-10 bg-slate-700/50 rounded w-2/3 mb-6" />

          {/* Details Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="h-3 bg-slate-700/30 rounded w-24 mb-2" />
              <div className="h-6 bg-slate-700/50 rounded w-32" />
            </div>

            <div>
              <div className="h-3 bg-slate-700/30 rounded w-20 mb-2" />
              <div className="h-6 bg-slate-700/50 rounded w-40" />
            </div>

            <div>
              <div className="h-3 bg-slate-700/30 rounded w-20 mb-2" />
              <div className="h-6 bg-slate-700/50 rounded w-16" />
            </div>
          </div>

          {/* Description Skeleton */}
          <div>
            <div className="h-3 bg-slate-700/30 rounded w-24 mb-2" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-700/40 rounded w-full" />
              <div className="h-4 bg-slate-700/40 rounded w-full" />
              <div className="h-4 bg-slate-700/40 rounded w-5/6" />
              <div className="h-4 bg-slate-700/40 rounded w-4/6" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
