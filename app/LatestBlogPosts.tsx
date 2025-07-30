"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_url?: string;
}

export default function LatestBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="latest-blog" className="w-full max-w-6xl mx-auto px-4 py-10 mb-10 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-8 text-orange-300 drop-shadow text-center">Latest from the Cabal</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32 text-gray-400">Loading...</div>
      ) : (
        <div className="flex flex-col items-center gap-y-10 w-full">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#18181b] rounded-2xl shadow-xl border border-orange-900/20 p-8 flex flex-col items-center w-full max-w-2xl mx-auto">
              <div className="mb-4 rounded-lg overflow-hidden h-56 w-full bg-gray-800 flex items-center justify-center">
                {post.cover_url ? (
                  <img src={post.cover_url} alt="Blog cover" className="object-cover w-full h-full" onError={e => (e.currentTarget.src = '/fallback.jpg')} />
                ) : (
                  <span className="text-gray-600">No cover image</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-orange-400 mb-2 drop-shadow text-center w-full">{post.title}</h3>
              <p className="text-gray-300 mb-4 text-base text-center w-full">{post.content.replace(/<[^>]+>/g, '').slice(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
              <Link href={`/blog/${post.id}`} className="text-orange-400 underline text-base font-semibold hover:text-orange-300 mt-auto">Read more →</Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
