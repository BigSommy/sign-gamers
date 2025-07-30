"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_url?: string;
  created_at: string;
  excerpt?: string;
}

const BlogCard = ({ post }: { post: BlogPost }) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="blog-card bg-[#18181b] rounded-xl shadow-xl border border-orange-900/20 overflow-hidden">
      {post.cover_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={post.cover_url} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/fallback.jpg';
            }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="text-sm text-orange-400 mb-2">{formattedDate}</div>
        <h2 className="blog-title text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h2>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {post.excerpt || post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
        </p>
        <Link 
          href={`/blog/${post.id}`}
          className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors group"
        >
          Read more
          <svg 
            className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

const BlogSkeleton = () => (
  <div className="bg-[#18181b] rounded-xl shadow-xl border border-orange-900/20 overflow-hidden">
    <div className="h-48 bg-gray-800 animate-pulse"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-4 animate-pulse"></div>
      <div className="h-6 bg-gray-800 rounded w-full mb-3 animate-pulse"></div>
      <div className="h-4 bg-gray-800 rounded w-5/6 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-800 rounded w-2/3 mb-4 animate-pulse"></div>
      <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse"></div>
    </div>
  </div>
);

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const postsPerPage = 6;

  const fetchPosts = async (pageNum: number) => {
    setLoading(true);
    const from = (pageNum - 1) * postsPerPage;
    const to = from + postsPerPage - 1;

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      return;
    }

    if (data) {
      if (data.length < postsPerPage) {
        setHasMore(false);
      }
      
      setPosts(prevPosts => (pageNum === 1 ? data : [...prevPosts, ...data]));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f12] via-[#18181b] to-[#1a1a1f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4 font-['Exo_2']">The Sign Gamers Blog</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Latest updates, news, and insights from the Sign Gamers community</p>
        </div>
        
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <BlogSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-300 inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
  );
}


