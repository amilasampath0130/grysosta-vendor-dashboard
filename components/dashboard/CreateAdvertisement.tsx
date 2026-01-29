"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function CreateAdvertisement() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [advertisementType, setAdvertisementType] = useState("banner");
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Create Advertisement</h1>
        <form className="space-y-4">
          {/* Advertisement Title */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Advertisement Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Content
            </label>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            />
          </div>
          {/* Advertisement Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Advertisement Type
            </label>
            <select
              value={advertisementType}
              onChange={(e) => setAdvertisementType(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            >
              <option value="banner">Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="popup">Popup</option>
            </select>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImage(e.target.files[0]);
                }
              }}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            />
            <button
              type="button"
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => router.back()}
            >
              Submit Advertisement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
