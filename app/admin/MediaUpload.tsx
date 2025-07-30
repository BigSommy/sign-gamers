import { useRef, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MediaUpload() {
  const [type, setType] = useState("screenshot");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent uploads
  useEffect(() => {
    supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecent(data || []));
  }, [uploading]);

  const handleUpload = async () => {
    setMessage(null);
    if (!file) return setMessage("No file selected");
    if (type === "clip" && file.type !== "video/mp4") return setMessage("Clips must be mp4 video files.");
    if ((type !== "clip") && !file.type.startsWith("image/")) return setMessage("Only images allowed for this type.");
    if (file.size > 59 * 1024 * 1024) return setMessage("File too large (max 59MB)");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `media/${Date.now()}.${ext}`;
    // Use 'media' bucket for uploads
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      setMessage("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    await supabase.from("media_assets").insert({
      type,
      title,
      url: urlData.publicUrl,
    });
    setUploading(false);
    setTitle("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    setMessage("Media uploaded!");
  };

  // Delete media asset
  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Delete this media?')) return;
    // Remove from storage bucket
    const path = url.split('/media/')[1];
    if (path) await supabase.storage.from('media').remove([`media/${path}`]);
    // Remove from table
    await supabase.from('media_assets').delete().eq('id', id);
    setRecent(recent.filter(item => item.id !== id));
    setMessage('Media deleted.');
  };

  return (
    <div className="bg-[#222] p-4 rounded-xl mb-6">
      <h2 className="text-lg font-bold mb-2 text-orange-400">Upload Media</h2>
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="mb-2 p-2 rounded bg-gray-800 text-white"
      >
        <option value="screenshot">Screenshot</option>
        <option value="irlevent">IRL Event</option>
        <option value="clip">Clip (mp4)</option>
      </select>
      <input
        type="text"
        placeholder="Title (optional)"
        className="mb-2 p-2 rounded bg-gray-800 text-white w-full"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="file"
        accept={type === "clip" ? "video/mp4" : "image/*"}
        className="mb-2"
        ref={inputRef}
        onChange={e => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <div className={`mt-2 text-sm ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>{message}</div>}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-2 text-orange-300">Recent Uploads</h3>
        <div className="grid grid-cols-2 gap-2">
          {recent.map(item => (
            <div key={item.id} className="bg-gray-900 rounded p-2 flex flex-col items-center relative">
              <button
                onClick={() => handleDelete(item.id, item.url)}
                className="absolute top-1 right-1 text-xs text-red-400 hover:text-red-600 bg-black bg-opacity-60 rounded px-1"
                title="Delete"
              >
                ✕
              </button>
              {item.type === 'clip' ? (
                <video src={item.url} className="w-full h-20 object-contain mb-1 bg-black" controls />
              ) : (
                <img src={item.url} className="w-full h-20 object-contain mb-1 bg-black" alt={item.title || item.type} onError={e => (e.currentTarget.src = '/fallback.jpg')} />
              )}
              <div className="text-xs text-gray-300 truncate w-full text-center">{item.title || item.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
