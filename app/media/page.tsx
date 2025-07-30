"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const TABS = [
	{ key: "screenshot", label: "Screenshots" },
	{ key: "irlevent", label: "IRL Events" },
	{ key: "clip", label: "Clips" },
];

export default function MediaGalleryPage() {
	const [tab, setTab] = useState("screenshot");
	const [media, setMedia] = useState<any[]>([]); // Fix type error
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		supabase
			.from("media_assets")
			.select("*")
			.eq("type", tab) // Only fetch media for the selected tab/type
			.order("created_at", { ascending: false })
			.then(({ data, error }) => {
				if (error) toast.error("Failed to load media");
				setMedia(data || []);
				setLoading(false);
			});
	}, [tab]);

	return (
		<main className="min-h-screen p-4 md:p-6 bg-black text-white animate-fade-in">
			<h1 className="text-3xl font-bold mb-6 text-orange-400 text-center drop-shadow-lg transition-colors duration-200 hover:text-orange-300 cursor-pointer">
				Media Gallery
			</h1>
			<div className="flex justify-center mb-6 gap-2">
				{TABS.map((t) => (
					<button
						key={t.key}
						className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
							tab === t.key
								? "bg-orange-500 text-black scale-105 shadow-lg"
								: "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105"
						}`}
						onClick={() => setTab(t.key)}
					>
						{t.label}
					</button>
				))}
			</div>
			{loading ? (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1 sm:px-2 md:px-4 animate-pulse">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="h-40 bg-gray-800 rounded-lg" />
					))}
				</div>
			) : media.length === 0 ? (
				<div className="text-center text-gray-400 mt-12 px-2">
					No media found in this category.
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1 sm:px-2 md:px-4">
					{media.map((item) => (
						<div
							key={item.id}
							className="bg-gray-900 rounded-lg overflow-hidden shadow-lg flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-orange-500/30 group"
						>
							{tab === "clip" ? (
								<video
									controls
									className="w-full h-40 object-contain bg-black transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
								>
									<source src={item.url} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
							) : (
								<img
									src={item.url}
									alt={item.title || tab}
									className="w-full h-40 object-contain bg-black transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
									onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
								/>
							)}
							<div className="p-2 flex-1 flex flex-col justify-between">
								<div className="font-semibold text-sm truncate mb-1 group-hover:text-orange-300 transition-colors duration-200">
									{item.title || "Untitled"}
								</div>
								<div className="text-xs text-gray-500 italic">
									{new Date(item.created_at).toLocaleDateString()}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</main>
	);
}
