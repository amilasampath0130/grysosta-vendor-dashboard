"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  MapPin,
  Tag,
  Percent,
  DollarSign,
  Upload,
  X,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function CreateOffer() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offerType: "bogo",
    discountValue: 0,
    location: "all",
    activeDays: [] as string[],
    validUntil: "",
    redemptionLimit: "once_per_user",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const daysOfWeek = [
    { id: "mon", label: "Monday", short: "Mon" },
    { id: "tue", label: "Tuesday", short: "Tue" },
    { id: "wed", label: "Wednesday", short: "Wed" },
    { id: "thu", label: "Thursday", short: "Thu" },
    { id: "fri", label: "Friday", short: "Fri" },
    { id: "sat", label: "Saturday", short: "Sat" },
    { id: "sun", label: "Sunday", short: "Sun" },
  ];

  const offerTypes = [
    { value: "bogo", label: "Buy One Get One", icon: Tag },
    { value: "percentage", label: "Percentage Discount", icon: Percent },
    { value: "flat", label: "Flat Discount", icon: DollarSign },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDayToggle = (dayId: string) => {
    setFormData((prev) => ({
      ...prev,
      activeDays: prev.activeDays.includes(dayId)
        ? prev.activeDays.filter((d) => d !== dayId)
        : [...prev.activeDays, dayId],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setImage(file);
      setErrors((prev) => ({ ...prev, image: "" }));

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
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Offer title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (formData.offerType !== "bogo" && formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }

    if (formData.offerType === "percentage" && formData.discountValue > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Please select an expiry date";
    } else {
      const selectedDate = new Date(formData.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.validUntil = "Expiry date must be in the future";
      }
    }

    if (formData.activeDays.length === 0) {
      newErrors.activeDays = "Please select at least one active day";
    }

    if (!image) {
      newErrors.image = "Please upload an offer image";
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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("offerType", formData.offerType);
      formDataToSend.append("discountValue", String(formData.discountValue));
      formDataToSend.append("location", formData.location);
      formDataToSend.append("activeDays", JSON.stringify(formData.activeDays));
      formDataToSend.append("validUntil", formData.validUntil);
      formDataToSend.append("redemptionLimit", formData.redemptionLimit);
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await fetch(`${apiUrl}/api/offers`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        const code = String(data?.code || "").trim();
        if (code === "SUBSCRIPTION_REQUIRED") {
          router.push(
            `/vendor/billing?next=${encodeURIComponent(
              "/vendor/dashboard/create-offer",
            )}`,
          );
          return;
        }
        if (code === "PLAN_LIMIT_REACHED") {
          alert(data?.message || "Your current plan has reached its offer limit.");
          router.push("/vendor/billing");
          return;
        }
        throw new Error(data?.message || "Failed to create offer");
      }

      alert("Offer submitted for admin review!");
      router.push("/vendor/offers");
    } catch (error) {
      console.error("Error creating offer:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create offer. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.description || image) {
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

  const getDiscountLabel = () => {
    switch (formData.offerType) {
      case "percentage":
        return "%";
      case "flat":
        return "$";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors "
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create Special Offer
              </h1>
              <p className="text-gray-600 mt-2">
                Craft compelling deals and discounts to attract more customers
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Basic Information
              </h2>

              {/* Offer Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Weekend Special: 30% Off All Pizzas"
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your offer in detail. What makes it special?"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between mt-2">
                  {errors.description ? (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Minimum 20 characters
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Image *
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Offer preview"
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
                    hover:border-emerald-400 hover:bg-emerald-50
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
                      <span className="font-medium text-emerald-600">
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
            </div>

            {/* Offer Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Offer Details
              </h2>

              {/* Offer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Offer Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {offerTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          handleInputChange("offerType", type.value)
                        }
                        className={`p-4 rounded-lg border transition-all flex flex-col items-center ${
                          formData.offerType === type.value
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-20"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        disabled={isSubmitting}
                      >
                        <Icon className="w-8 h-8 mb-2 text-emerald-600" />
                        <div className="font-medium text-gray-900">
                          {type.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount Value */}
              {formData.offerType !== "bogo" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <div className="relative">
                    {formData.offerType === "percentage" && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </div>
                    )}
                    {formData.offerType === "flat" && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </div>
                    )}
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) =>
                        handleInputChange(
                          "discountValue",
                          Number(e.target.value),
                        )
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.discountValue
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={
                        formData.offerType === "percentage" ? "0-100" : "0.00"
                      }
                      step={formData.offerType === "percentage" ? "1" : "0.01"}
                      min="0"
                      max={
                        formData.offerType === "percentage" ? "100" : undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.discountValue && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.discountValue}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Schedule & Location */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Schedule & Location
              </h2>

              {/* Active Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Active Days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        formData.activeDays.includes(day.id)
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                      disabled={isSubmitting}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                {errors.activeDays && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.activeDays}
                  </p>
                )}
              </div>

              {/* Validity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        handleInputChange("validUntil", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.validUntil ? "border-red-500" : "border-gray-300"
                      }`}
                      min={new Date().toISOString().split("T")[0]}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.validUntil && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.validUntil}
                    </p>
                  )}
                </div>

                {/* Redemption Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redemption Limit *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.redemptionLimit}
                      onChange={(e) =>
                        handleInputChange("redemptionLimit", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      disabled={isSubmitting}
                    >
                      <option value="once_per_user">Once per User</option>
                      <option value="once_per_day">Once per Day</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    <option value="all">All Locations</option>
                    <option value="single">Selected Location Only</option>
                  </select>
                </div>
              </div>
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
                className="flex-1 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Offer...
                  </>
                ) : (
                  "Create Offer"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-medium text-emerald-800 mb-2">
            Best practices for creating offers:
          </h3>
          <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
            <li>Use clear, attractive images that showcase your offer</li>
            <li>Create compelling titles that highlight the value</li>
            <li>Set realistic expiry dates to create urgency</li>
            <li>Choose redemption limits based on your business capacity</li>
            <li>Consider offering BOGO deals to attract new customers</li>
            <li>Test different discount types to see what works best</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
