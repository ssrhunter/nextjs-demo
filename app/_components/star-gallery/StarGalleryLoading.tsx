export default function StarGalleryLoading() {
  return (
    <div className="w-full py-8">
      <div className="flex gap-8 overflow-x-hidden px-[calc(50vw-10rem)]">
        {/* Render 3 skeleton cards */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-80 rounded-xl overflow-hidden"
          >
            {/* Skeleton card with pulsing animation */}
            <div className="bg-gradient-to-br from-slate-900/80 to-indigo-950/80 backdrop-blur-sm border border-indigo-500/30 shadow-lg shadow-indigo-500/20 animate-pulse">
              
              {/* Skeleton photo area */}
              <div className="relative w-full aspect-video bg-slate-800/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent animate-[shimmer_2s_infinite]" />
              </div>

              {/* Skeleton information area */}
              <div className="p-5 space-y-3">
                {/* Skeleton star name */}
                <div className="h-8 bg-slate-700/50 rounded w-3/4" />

                {/* Skeleton details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="h-3 bg-slate-700/30 rounded w-20 mb-2" />
                    <div className="h-5 bg-slate-700/50 rounded w-24" />
                  </div>

                  <div>
                    <div className="h-3 bg-slate-700/30 rounded w-16 mb-2" />
                    <div className="h-5 bg-slate-700/50 rounded w-20" />
                  </div>

                  <div>
                    <div className="h-3 bg-slate-700/30 rounded w-20 mb-2" />
                    <div className="h-5 bg-slate-700/50 rounded w-16" />
                  </div>
                </div>

                {/* Skeleton description */}
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700/40 rounded w-full" />
                  <div className="h-4 bg-slate-700/40 rounded w-5/6" />
                  <div className="h-4 bg-slate-700/40 rounded w-4/6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
