import Image from 'next/image';
import { Star } from '@/lib/supabase/types';

interface StarCardProps {
  star: Star;
  scale: number;
  className?: string;
}

export default function StarCard({ star, scale, className = '' }: StarCardProps) {
  return (
    <article
      className={`relative flex-shrink-0 w-80 rounded-xl overflow-hidden transition-transform duration-300 ease-out ${className}`}
      style={{ 
        transform: `scale(${scale})`,
        willChange: 'transform'
      }}
      aria-label={`Star card for ${star.name}`}
    >
      {/* Card background with space theme */}
      <div className="bg-gradient-to-br from-slate-900/80 to-indigo-950/80 backdrop-blur-sm border border-indigo-500/30 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-400/40 transition-shadow duration-300">
        
        {/* Star photo */}
        <div className="relative w-full aspect-video bg-slate-950/50">
          <Image
            src={star.photo_url}
            alt={`${star.name} - A star in the ${star.constellation} constellation, ${star.distance_light_years.toLocaleString()} light years away`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
            loading="lazy"
            quality={85}
          />
        </div>

        {/* Star information */}
        <div className="p-5 space-y-3">
          {/* Star name */}
          <h3 className="text-2xl font-bold text-slate-50 tracking-wide">
            {star.name}
          </h3>

          {/* Star details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Constellation
              </p>
              <p className="text-indigo-200 font-medium">
                {star.constellation}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Distance
              </p>
              <p className="text-indigo-200 font-medium">
                {star.distance_light_years.toLocaleString()} ly
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Magnitude
              </p>
              <p className="text-indigo-200 font-medium">
                {star.magnitude.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Description */}
          {star.description && (
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
              {star.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
