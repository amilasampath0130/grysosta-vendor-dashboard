"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Home,
  Briefcase,
  Upload,
  X,
  AlertCircle,
  LogOut,
  ArrowLeft,
  CheckCircle,
  FileText,
  Store,
  MapPinned,
  Tag,
  ScrollText,
  Landmark,
  Globe
} from "lucide-react";

export default function Information() {
  // Personal details
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
  });

  // Business details
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    businessCategory: "",
    businessAddress: "",
    businessPhoneNumber: "",
    typeofoffering: "",
    website: "",
    yearEstablished: "",
    taxId: "",
  });

  // File uploads
  const [userIdImage, setUserIdImage] = useState<File | null>(null);
  const [userIdPreview, setUserIdPreview] = useState<string | null>(null);
  const [businessRegImage, setBusinessRegImage] = useState<File | null>(null);
  const [businessRegPreview, setBusinessRegPreview] = useState<string | null>(null);
  const [vendorLogo, setVendorLogo] = useState<File | null>(null);
  const [vendorLogoPreview, setVendorLogoPreview] = useState<string | null>(null);

  // UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"personal" | "business" | "documents">("personal");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get("email") || "";
    const reasonParam = searchParams?.get("reason") || "";
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
    if (reasonParam) {
      setRejectionReason(reasonParam);
    }
  }, [searchParams]);

  const handleFormChange = (field: string, value: string, isBusiness: boolean = false) => {
    if (isBusiness) {
      setBusinessData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateImageDimensions = (
    file: File,
    expectedWidth: number,
    expectedHeight: number,
  ) =>
    new Promise<{ ok: true } | { ok: false; message: string }>((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const w = (img as HTMLImageElement).naturalWidth;
        const h = (img as HTMLImageElement).naturalHeight;
        URL.revokeObjectURL(objectUrl);

        if (w === expectedWidth && h === expectedHeight) {
          resolve({ ok: true });
          return;
        }

        resolve({
          ok: false,
          message: `Logo must be exactly ${expectedWidth}×${expectedHeight}px (uploaded ${w}×${h}px)`,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ ok: false, message: "Could not read image dimensions" });
      };

      img.src = objectUrl;
    });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "business" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, [type === "id" ? "userIdImage" : type === "business" ? "businessRegImage" : "vendorLogo"]: "Please upload an image file" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1025 * 1025) {
      setErrors(prev => ({ ...prev, [type === "id" ? "userIdImage" : type === "business" ? "businessRegImage" : "vendorLogo"]: "File size should be less than 5MB" }));
      return;
    }

    if (type === "logo") {
      const dimensionCheck = await validateImageDimensions(file, 1080, 1080);
      if (!dimensionCheck.ok) {
        setErrors(prev => ({ ...prev, vendorLogo: dimensionCheck.message }));
        return;
      }

      setVendorLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVendorLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, vendorLogo: "" }));
      return;
    }

    if (type === "id") {
      setUserIdImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBusinessRegImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessRegPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setErrors(prev => ({ ...prev, [type === "id" ? "userIdImage" : "businessRegImage"]: "" }));
  };

  const removeFile = (type: "id" | "business" | "logo") => {
    if (type === "id") {
      setUserIdImage(null);
      setUserIdPreview(null);
    } else if (type === "business") {
      setBusinessRegImage(null);
      setBusinessRegPreview(null);
    } else {
      setVendorLogo(null);
      setVendorLogoPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Personal details validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Business details validation
    if (!businessData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!businessData.businessType.trim()) {
      newErrors.businessType = "Business type is required";
    }
    if (!businessData.businessCategory.trim()) {
      newErrors.businessCategory = "Business category is required";
    }
    if (!businessData.businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required";
    }
    if (!businessData.businessPhoneNumber.trim()) {
      newErrors.businessPhoneNumber = "Business phone number is required";
    } else if (!/^\d{10,}$/.test(businessData.businessPhoneNumber.replace(/\D/g, ''))) {
      newErrors.businessPhoneNumber = "Please enter a valid phone number";
    }

    // Document validation
    if (!userIdImage) {
      newErrors.userIdImage = "Government ID image is required";
    }
    if (!businessRegImage) {
      newErrors.businessRegImage = "Business registration image is required";
    }
    if (!vendorLogo) {
      newErrors.vendorLogo = "Business logo (1080×1080) is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;

    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector(".border-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append personal details
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Append business details
      Object.entries(businessData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Append files
      if (userIdImage) submitData.append("userIdImage", userIdImage);
      if (businessRegImage) submitData.append("businessRegImage", businessRegImage);
      if (vendorLogo) submitData.append("vendorLogo", vendorLogo);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/submit-info`,
        {
          method: "POST",
          credentials: "include",
          body: submitData,
        }
      );

      const data = await response.json();

      if (data.success) {
        router.push("/vendor/pending");
      } else {
        setErrors({ submit: data.message || "Submission failed" });
      }
    } catch (err) {
      setErrors({ submit: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      router.push("/auth/login");
    }
  };

  const businessTypes = [
    "Retail",
    "Restaurant",
    "Service Provider",
    "Manufacturing",
    "Wholesale",
    "E-commerce",
    "Professional Services",
    "Healthcare",
    "Education",
    "Entertainment",
  ];

  const businessCategories = [
    "Food & Beverage",
    "Fashion & Apparel",
    "Electronics",
    "Home & Garden",
    "Health & Beauty",
    "Automotive",
    "Sports & Recreation",
    "Books & Media",
    "Toys & Hobbies",
    "Professional Services",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Registration</h1>
              <p className="text-gray-600 mt-2">
                Complete your profile to start selling on our platform
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center w-full max-w-2xl">
              <Step 
                number={1} 
                title="Personal" 
                active={activeTab === "personal"} 
                completed={activeTab !== "personal" && !!formData.firstName && !!formData.lastName}
              />
              <div className={`flex-1 h-1 mx-2 ${activeTab !== "personal" && !!formData.firstName ? "bg-emerald-500" : "bg-gray-200"}`} />
              <Step 
                number={2} 
                title="Business" 
                active={activeTab === "business"} 
                completed={activeTab !== "business" && !!businessData.businessName}
              />
              <div className={`flex-1 h-1 mx-2 ${activeTab !== "business" && !!businessData.businessName ? "bg-emerald-500" : "bg-gray-200"}`} />
              <Step 
                number={3} 
                title="Documents" 
                active={activeTab === "documents"} 
                completed={activeTab !== "documents" && !!userIdImage && !!businessRegImage && !!vendorLogo}
              />
            </div>
          </div>
        </div>

        {/* Rejection Banner */}
        {rejectionReason && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Application Previously Rejected</h3>
                <p className="text-red-700 mt-1">Reason: {rejectionReason}</p>
                <p className="text-red-600 text-sm mt-2">
                  Please update your information based on the feedback above.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <TabButton
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
                icon={<User className="w-5 h-5" />}
                label="Personal Details"
              />
              <TabButton
                active={activeTab === "business"}
                onClick={() => setActiveTab("business")}
                icon={<Building2 className="w-5 h-5" />}
                label="Business Details"
              />
              <TabButton
                active={activeTab === "documents"}
                onClick={() => setActiveTab("documents")}
                icon={<FileText className="w-5 h-5" />}
                label="Documents"
              />
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Personal Details Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                      label="First Name *"
                      value={formData.firstName}
                      onChange={(value) => handleFormChange("firstName", value)}
                      error={errors.firstName}
                      icon={<User className="w-5 h-5" />}
                      placeholder="John"
                    />
                    <InputField
                      label="Middle Name"
                      value={formData.middleName}
                      onChange={(value) => handleFormChange("middleName", value)}
                      icon={<User className="w-5 h-5" />}
                      placeholder="(Optional)"
                    />
                    <InputField
                      label="Last Name *"
                      value={formData.lastName}
                      onChange={(value) => handleFormChange("lastName", value)}
                      error={errors.lastName}
                      icon={<User className="w-5 h-5" />}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h2>
                  <div className="space-y-4">
                    <InputField
                      label="Street Address *"
                      value={formData.address}
                      onChange={(value) => handleFormChange("address", value)}
                      error={errors.address}
                      icon={<Home className="w-5 h-5" />}
                      placeholder="123 Main St"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField
                        label="City *"
                        value={formData.city}
                        onChange={(value) => handleFormChange("city", value)}
                        error={errors.city}
                        icon={<MapPin className="w-5 h-5" />}
                        placeholder="New York"
                      />
                      <InputField
                        label="State/Province *"
                        value={formData.state}
                        onChange={(value) => handleFormChange("state", value)}
                        error={errors.state}
                        icon={<MapPinned className="w-5 h-5" />}
                        placeholder="NY"
                      />
                      <InputField
                        label="ZIP Code *"
                        value={formData.zipCode}
                        onChange={(value) => handleFormChange("zipCode", value)}
                        error={errors.zipCode}
                        icon={<Tag className="w-5 h-5" />}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Email Address *"
                      type="email"
                      value={formData.email}
                      onChange={(value) => handleFormChange("email", value)}
                      error={errors.email}
                      icon={<Mail className="w-5 h-5" />}
                      placeholder="john@example.com"
                    />
                    <InputField
                      label="Phone Number *"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(value) => handleFormChange("phoneNumber", value)}
                      error={errors.phoneNumber}
                      icon={<Phone className="w-5 h-5" />}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("business")}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Next: Business Details
                  </button>
                </div>
              </div>
            )}

            {/* Business Details Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h2>
                  <div className="space-y-4">
                    <InputField
                      label="Business Name *"
                      value={businessData.businessName}
                      onChange={(value) => handleFormChange("businessName", value, true)}
                      error={errors.businessName}
                      icon={<Store className="w-5 h-5" />}
                      placeholder="Acme Inc."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField
                        label="Business Type *"
                        value={businessData.businessType}
                        onChange={(value) => handleFormChange("businessType", value, true)}
                        error={errors.businessType}
                        icon={<Briefcase className="w-5 h-5" />}
                        options={businessTypes}
                      />
                      <SelectField
                        label="Business Category *"
                        value={businessData.businessCategory}
                        onChange={(value) => handleFormChange("businessCategory", value, true)}
                        error={errors.businessCategory}
                        icon={<Globe className="w-5 h-5" />}
                        options={businessCategories}
                      />
                    </div>

                    <InputField
                      label="Business Address *"
                      value={businessData.businessAddress}
                      onChange={(value) => handleFormChange("businessAddress", value, true)}
                      error={errors.businessAddress}
                      icon={<MapPin className="w-5 h-5" />}
                      placeholder="456 Business Ave, Suite 100"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Business Phone *"
                        type="tel"
                        value={businessData.businessPhoneNumber}
                        onChange={(value) => handleFormChange("businessPhoneNumber", value, true)}
                        error={errors.businessPhoneNumber}
                        icon={<Phone className="w-5 h-5" />}
                        placeholder="+1 234 567 8900"
                      />
                      <InputField
                        label="Website"
                        value={businessData.website}
                        onChange={(value) => handleFormChange("website", value, true)}
                        icon={<Globe className="w-5 h-5" />}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Year Established"
                        type="number"
                        value={businessData.yearEstablished}
                        onChange={(value) => handleFormChange("yearEstablished", value, true)}
                        icon={<Landmark className="w-5 h-5" />}
                        placeholder="2020"
                      />
                      <InputField
                        label="Tax ID / EIN"
                        value={businessData.taxId}
                        onChange={(value) => handleFormChange("taxId", value, true)}
                        icon={<ScrollText className="w-5 h-5" />}
                        placeholder="XX-XXXXXXX"
                      />
                    </div>

                    <InputField
                      label="Type of Offering"
                      value={businessData.typeofoffering}
                      onChange={(value) => handleFormChange("typeofoffering", value, true)}
                      icon={<Tag className="w-5 h-5" />}
                      placeholder="Products, Services, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("personal")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("documents")}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Next: Documents
                  </button>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h2>
                  <p className="text-gray-600 mb-6">
                    Please upload clear, legible images of the following documents. 
                    Accepted formats: JPG, PNG, GIF (Max 5MB each)
                  </p>

                  {/* Government ID Upload */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Government-issued ID * 
                      <span className="text-gray-500 text-xs ml-2">
                        (Passport, Driver's License, or National ID)
                      </span>
                    </label>
                    
                    {userIdPreview ? (
                      <div className="relative mb-4">
                        <img
                          src={userIdPreview}
                          alt="ID Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("id")}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <FileUpload
                        onChange={(e) => handleFileChange(e, "id")}
                        error={errors.userIdImage}
                      />
                    )}
                  </div>

                  {/* Business Registration Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Registration Document * 
                      <span className="text-gray-500 text-xs ml-2">
                        (Business License, Tax Registration, or Incorporation Certificate)
                      </span>
                    </label>
                    
                    {businessRegPreview ? (
                      <div className="relative mb-4">
                        <img
                          src={businessRegPreview}
                          alt="Business Registration Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("business")}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <FileUpload
                        onChange={(e) => handleFileChange(e, "business")}
                        error={errors.businessRegImage}
                      />
                    )}
                  </div>

                  {/* Vendor Logo Upload */}
                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Logo (1080×1080) *
                      <span className="text-gray-500 text-xs ml-2">
                        (Used for offer display)
                      </span>
                    </label>

                    {vendorLogoPreview ? (
                      <div className="relative mb-4">
                        <img
                          src={vendorLogoPreview}
                          alt="Vendor Logo Preview"
                          className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("logo")}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <FileUpload
                        onChange={(e) => handleFileChange(e, "logo")}
                        error={errors.vendorLogo}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("business")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Global Error */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 " />
            <div>
              <h3 className="font-medium text-blue-800">Why we need this information</h3>
              <p className="text-sm text-blue-700 mt-1">
                We collect this information to verify your identity and business legitimacy. 
                All documents are securely stored and handled in compliance with data protection regulations.
                Your information will only be used for verification purposes and won't be shared publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const Step = ({ number, title, active, completed }: { number: number; title: string; active: boolean; completed: boolean }) => (
  <div className="flex flex-col items-center">
    <div className={`
      w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
      ${active ? "bg-emerald-600 text-white" : completed ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-600"}
    `}>
      {completed ? <CheckCircle className="w-4 h-4" /> : number}
    </div>
    <span className="text-xs mt-1 text-gray-600">{title}</span>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm
      border-b-2 transition-colors
      ${active 
        ? "border-emerald-500 text-emerald-600" 
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }
    `}
  >
    {icon}
    {label}
  </button>
);

const InputField = ({ 
  label, 
  value, 
  onChange, 
  error, 
  icon, 
  type = "text", 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  error?: string; 
  icon?: React.ReactNode; 
  type?: string; 
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2 border rounded-lg
          focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          transition-colors
          ${error ? "border-red-500" : "border-gray-300"}
        `}
        placeholder={placeholder}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  error, 
  icon, 
  options 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  error?: string; 
  icon?: React.ReactNode; 
  options: string[];
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2 border rounded-lg
          focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          transition-colors appearance-none bg-white
          ${error ? "border-red-500" : "border-gray-300"}
        `}
      >
        <option value="">Select...</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

const FileUpload = ({ onChange, error }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }) => (
  <div>
    <label className={`
      block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
      transition-colors hover:border-emerald-400 hover:bg-emerald-50
      ${error ? "border-red-500" : "border-gray-300"}
    `}>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <div className="text-gray-600">
        <span className="font-medium text-emerald-600">Click to upload</span> or drag and drop
      </div>
      <div className="text-sm text-gray-500 mt-2">
        PNG, JPG, GIF up to 5MB
      </div>
    </label>
    {error && (
      <p className="mt-2 text-sm text-red-600">{error}</p>
    )}
  </div>
);