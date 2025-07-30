'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function LatestMedia() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('media_assets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setMedia(data || []);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse my-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (media.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-orange-400 font-['Exo_2']">Latest Media</h2>
        <Link 
          href="/media" 
          className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
        >
          View All <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {media.map((item) => (
          <div 
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-gray-900 aspect-video hover:ring-2 hover:ring-orange-400 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-orange-500/20"
            onClick={() => setSelectedMedia(item)}
          >
            {item.type === 'clip' ? (
              <>
                <video 
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                >
                  <source src={item.url} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-orange-500/80 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white ml-1">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={item.url}
                alt={item.title || 'Media preview'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.src = '/fallback.jpg')}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
              <div></div>
              <div>
                <h3 className="text-white text-lg font-semibold">{item.title || 'Untitled'}</h3>
                <p className="text-orange-300 text-sm">{item.type === 'clip' ? 'Video' : 'Screenshot'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for fullscreen view */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-orange-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMedia(null);
            }}
          >
            <X size={32} />
          </button>
          <div className="max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {selectedMedia.type === 'clip' ? (
              <video 
                className="w-full h-full max-h-[80vh] object-contain"
                controls
                autoPlay
                src={selectedMedia.url}
              />
            ) : (
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.title || 'Media'} 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{selectedMedia.title || 'Untitled'}</h3>
              <p className="text-gray-300">{selectedMedia.type === 'clip' ? 'Video' : 'Screenshot'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
