import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStarById } from '@/lib/supabase/stars';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StarDetailPage({ params }: PageProps) {
  // Extract the id parameter from the route params
  const { id } = await params;
  const starId = parseInt(id, 10);

  // Handle invalid ID (non-numeric)
  if (isNaN(starId)) {
    notFound();
  }

  // Fetch star data
  const star = await getStarById(starId);

  // Handle the case when star is not found
  if (!star) {
    notFound();
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-gradient-to-r from-indigo-600 to-indigo-800 text-slate-50 rounded-lg border border-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-400/40 hover:brightness-110 transition-all duration-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          aria-label="Return to home page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Back to Home</span>
        </Link>

        {/* Star Photo Section */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-2xl shadow-indigo-500/30">
          <Image
            src={star.photo_url}
            alt={`${star.name} - A star in the ${star.constellation} constellation, ${star.distance_light_years.toLocaleString()} light years away, magnitude ${star.magnitude.toFixed(2)}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
            priority
            quality={90}
          />
        </div>

        {/* Star Information Section */}
        <article className="bg-gradient-to-br from-slate-900/80 to-indigo-950/80 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-8 shadow-lg shadow-indigo-500/20">
          {/* Star Name */}
          <h1 className="text-4xl font-bold text-slate-50 mb-6 tracking-wide">
            {star.name}
          </h1>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                Constellation
              </p>
              <p className="text-indigo-200 text-lg font-medium">
                {star.constellation}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                Distance
              </p>
              <p className="text-indigo-200 text-lg font-medium">
                {star.distance_light_years.toLocaleString()} light years
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                Magnitude
              </p>
              <p className="text-indigo-200 text-lg font-medium">
                {star.magnitude.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Full Description */}
          {star.description && (
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                Description
              </p>
              <p className="text-slate-300 text-base leading-relaxed">
                {star.description}
              </p>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
