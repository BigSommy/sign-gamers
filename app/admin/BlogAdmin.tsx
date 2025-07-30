import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["General", "Update", "Tournament", "Media"];

export default function BlogAdmin() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [cover, setCover] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState(CATEGORIES[0]);
  const [editCoverUrl, setEditCoverUrl] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).then(({ data }) => setPosts(data || []));
  }, [loading]);

  const handleCoverUpload = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `blog_covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) return setMessage("Cover upload failed: " + error.message);
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    setCoverUrl(urlData.publicUrl);
    setMessage("Cover uploaded!");
  };

  const handleSubmit = async () => {
    setMessage(null);
    setLoading(true);
    if (!title || !content) {
      setMessage("Title and content required");
      setLoading(false);
      return;
    }
    
    // Preserve line breaks in the content
    const formattedContent = content;
    
    await supabase.from("blog_posts").insert({
      title,
      content: formattedContent,
      category,
      cover_url: coverUrl,
    });
    setTitle("");
    setContent("");
    setCategory(CATEGORIES[0]);
    setCover(null);
    setCoverUrl("");
    if (coverInputRef.current) coverInputRef.current.value = "";
    setMessage("Blog post created!");
    setLoading(false);
  };

  const handleEdit = (post: any) => {
    setEditId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditCoverUrl(post.cover_url || "");
  };

  const handleEditSubmit = async () => {
    setMessage(null);
    setLoading(true);
    await supabase.from("blog_posts").update({
      title: editTitle,
      content: editContent,
      category: editCategory,
      cover_url: editCoverUrl,
    }).eq("id", editId);
    setEditId(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory(CATEGORIES[0]);
    setEditCoverUrl("");
    setMessage("Blog post updated!");
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts(posts.filter(p => p.id !== id));
    setMessage("Post deleted.");
  };

  return (
    <div className="bg-[#222] p-4 rounded-xl mb-6">
      <h2 className="text-lg font-bold mb-2 text-orange-400">Blog Admin</h2>
      <input
        type="text"
        placeholder="Title"
        className="mb-2 p-2 rounded bg-gray-800 text-white w-full"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="mb-2 p-2 rounded bg-gray-800 text-white w-full"
      >
        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
        <textarea
          placeholder="Write your post here. Use @username to mention someone on X (Twitter)."
          className="p-2 rounded bg-gray-800 text-white w-full min-h-[200px] font-mono text-sm"
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ whiteSpace: 'pre-wrap' }}
        />
        <div className="text-xs text-gray-500 mt-1">
          Tip: Press Enter twice to create a new paragraph. Single line breaks are preserved.
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        className="mb-2"
        ref={coverInputRef}
        onChange={e => {
          const file = e.target.files?.[0];
          setCover(file || null);
          if (file) handleCoverUpload(file);
        }}
      />
      {coverUrl && <img src={coverUrl} alt="Cover preview" className="w-full h-32 object-contain mb-2 bg-black" />}
      <button
        onClick={handleSubmit}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        disabled={loading}
      >
        {loading ? "Saving..." : "Create Post"}
      </button>
      {message && <div className={`mt-2 text-sm ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</div>}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-2 text-orange-300">Existing Posts</h3>
        <div className="space-y-2">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-900 rounded p-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-orange-400">{post.title}</div>
                <div className="text-xs text-gray-400">{post.category} &middot; {new Date(post.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-xs text-blue-400 hover:text-blue-600 bg-black bg-opacity-60 rounded px-2"
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs text-red-400 hover:text-red-600 bg-black bg-opacity-60 rounded px-2"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        {editId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4 text-orange-400">Edit Post</h2>
              <input
                type="text"
                placeholder="Title"
                className="mb-2 p-2 rounded bg-gray-700 text-white w-full"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                className="mb-2 p-2 rounded bg-gray-700 text-white w-full"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                <textarea
                  placeholder="Write your post here. Use @username to mention someone on X (Twitter)."
                  className="p-2 rounded bg-gray-700 text-white w-full min-h-[200px] font-mono text-sm"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <div className="text-xs text-gray-400 mt-1">
                  Tip: Press Enter twice to create a new paragraph. Single line breaks are preserved.
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="mb-2"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
              />
              {editCoverUrl && <img src={editCoverUrl} alt="Cover preview" className="w-full h-32 object-contain mb-2 bg-black" />}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
