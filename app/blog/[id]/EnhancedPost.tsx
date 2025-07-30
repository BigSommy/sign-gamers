"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { renderBlogContent } from "@/lib/blogUtils";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  cover_url?: string;
  created_at: string;
  author?: string;
  tags?: string[];
}

export default function EnhancedPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Fetch blog post
  useEffect(() => {
    if (!id) return;
    
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const windowHeight = scrollHeight - clientHeight;
      const scrolled = (scrollTop / windowHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f12] via-[#18181b] to-[#1a1a1f] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-10 bg-gray-800 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-800 rounded-xl mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-800 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f12] via-[#18181b] to-[#1a1a1f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-orange-400 mb-4">Post Not Found</h1>
          <p className="text-gray-300 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/blog')}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    post.title
  )}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f12] via-[#18181b] to-[#1a1a1f]">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-orange-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <article className="relative">
          <header className="mb-12 text-center">
            {post.tags?.length > 0 && (
              <div className="flex justify-center gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 text-xs font-medium text-orange-300 bg-orange-900/30 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-orange-400 mb-6 font-['Exo_2'] leading-tight">
              {post.title}
            </h1>
            <div className="text-gray-400 text-sm">
              <time dateTime={post.created_at} className="text-orange-300">
                {formattedDate}
              </time>
              {post.author && (
                <>
                  <span className="mx-2 text-gray-600">•</span>
                  <span>By {post.author}</span>
                </>
              )}
            </div>
          </header>

          {post.cover_url && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/fallback.jpg';
                }}
              />
            </div>
          )}

          <div
            className="prose prose-invert max-w-none text-gray-200 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: renderBlogContent(post.content).replace(
                /<p>/g,
                '<p class="mb-6 last:mb-0">'
              ),
            }}
          />

          <footer className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-medium text-orange-400 mb-2">Share this post</h3>
                <div className="flex space-x-4">
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center"
              >
                Back to top
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
