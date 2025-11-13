export default function StarGalleryEmpty() {
  return (
    <div className="w-full py-20">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Empty state icon - stylized star constellation */}
        <div className="relative w-32 h-32 opacity-30">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-indigo-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            {/* Constellation pattern */}
            <circle cx="20" cy="30" r="2" fill="currentColor" />
            <circle cx="50" cy="20" r="2" fill="currentColor" />
            <circle cx="80" cy="35" r="2" fill="currentColor" />
            <circle cx="40" cy="60" r="2" fill="currentColor" />
            <circle cx="70" cy="70" r="2" fill="currentColor" />
            
            {/* Connecting lines */}
            <line x1="20" y1="30" x2="50" y2="20" strokeDasharray="2,2" />
            <line x1="50" y1="20" x2="80" y2="35" strokeDasharray="2,2" />
            <line x1="20" y1="30" x2="40" y2="60" strokeDasharray="2,2" />
            <line x1="40" y1="60" x2="70" y2="70" strokeDasharray="2,2" />
            <line x1="80" y1="35" x2="70" y2="70" strokeDasharray="2,2" />
          </svg>
        </div>

        {/* Empty state message */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-slate-300">
            No stars to display yet
          </h3>
          <p className="text-slate-500 text-sm max-w-md">
            The star gallery is empty. Stars will appear here once they are added to the database.
          </p>
        </div>
      </div>
    </div>
  );
}
