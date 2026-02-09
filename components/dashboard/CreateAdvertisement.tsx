"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, X, ArrowLeft } from "lucide-react";

export default function CreateAdvertisement() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [advertisementType, setAdvertisementType] = useState("banner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    image?: string;
  }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setImage(file);
      setErrors((prev) => ({ ...prev, image: undefined }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Advertisement title is required";
    } else if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }

    if (!image) {
      newErrors.image = "Please upload an image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      // In a real application, you would upload the image and send data to your API
      // const formData = new FormData();
      // formData.append('title', title);
      // formData.append('content', content);
      // formData.append('type', advertisementType);
      // if (image) formData.append('image', image);

      // const response = await fetch('/api/advertisements', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message and redirect
      alert("Advertisement created successfully!");
      router.push("/vendor/dashboard");
    } catch (error) {
      console.error("Error creating advertisement:", error);
      alert("Failed to create advertisement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || content || image) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      if (confirm) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Advertisement
              </h1>
              <p className="text-gray-600 mt-2">
                Promote your business to a wider audience with targeted
                advertisements
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Advertisement Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter a compelling title for your advertisement"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your advertisement in detail..."
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-2">
                {errors.content ? (
                  <p className="text-sm text-red-600">{errors.content}</p>
                ) : (
                  <p className="text-sm text-gray-500">Minimum 20 characters</p>
                )}
                <p className="text-sm text-gray-500">{content.length}/500</p>
              </div>
            </div>

            {/* Advertisement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "banner", label: "Banner", desc: "Header/Footer" },
                  { value: "sidebar", label: "Sidebar", desc: "Side panel" },
                  { value: "popup", label: "Popup", desc: "Modal window" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAdvertisementType(type.value)}
                    className={`p-4 rounded-lg border transition-all ${
                      advertisementType === type.value
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="font-medium text-gray-900">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image *
              </label>

              {imagePreview ? (
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    {image?.name} ({(image?.size || 0) / 1024} KB)
                  </p>
                </div>
              ) : (
                <label
                  className={`
                  block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  hover:border-blue-400 hover:bg-blue-50
                  ${errors.image ? "border-red-500" : "border-gray-300"}
                  ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                `}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600">
                    <span className="font-medium text-blue-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </div>
                </label>
              )}

              {errors.image && (
                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Submit Advertisement"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">
            Tips for effective advertisements:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Use clear, high-quality images that represent your business</li>
            <li>Write compelling titles that grab attention</li>
            <li>Include a clear call-to-action in your content</li>
            <li>
              Choose the advertisement type that best fits your campaign goals
            </li>
            <li>
              Banner ads work best for general awareness, sidebar for detailed
              offers, popup for promotions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
