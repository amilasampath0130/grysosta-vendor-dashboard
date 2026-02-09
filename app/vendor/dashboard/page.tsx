"use client";
import { useRouter } from "next/navigation";
import { Tag,  PlusCircle, ArrowRight } from "lucide-react";
import { BiSolidOffer } from "react-icons/bi";
import { useState } from "react";

// Simple reusable card component
const DashboardCard = ({
  title,
  description,
  icon,
  color,
  href,
  isComingSoon = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "gray";
  href?: string;
  isComingSoon?: boolean;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (isComingSoon || !href || isLoading) return;

    setIsLoading(true);
    router.push(href);
    // Reset loading state after navigation (fallback)
    setTimeout(() => setIsLoading(false), 1000);
  };

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 group-hover:bg-emerald-100",
      icon: "text-emerald-600",
      text: "text-emerald-600",
      border: "hover:border-emerald-200",
      hoverArrow: "group-hover:text-emerald-700",
      focusRing: "focus:ring-emerald-300",
      spinnerBase: "border-emerald-300",
      spinnerTop: "border-t-emerald-600",
    },
    blue: {
      bg: "bg-blue-50 group-hover:bg-blue-100",
      icon: "text-blue-600",
      text: "text-blue-600",
      border: "hover:border-blue-200",
      hoverArrow: "group-hover:text-blue-700",
      focusRing: "focus:ring-blue-300",
      spinnerBase: "border-blue-300",
      spinnerTop: "border-t-blue-600",
    },
    gray: {
      bg: "bg-gray-50 group-hover:bg-gray-100",
      icon: "text-gray-400",
      text: "text-gray-400",
      border: "",
      hoverArrow: "",
      focusRing: "focus:ring-gray-200",
      spinnerBase: "border-gray-300",
      spinnerTop: "border-t-gray-500",
    },
  };

  const currentColor = colorClasses[color];

  return (
    <button
      onClick={handleClick}
      disabled={isComingSoon || isLoading}
      className={`
        w-full h-full min-h-56 bg-white rounded-lg border border-gray-200
        flex flex-col items-center justify-center text-center
        px-4 py-6 sm:px-6 sm:items-start sm:text-left
        transition-all duration-300 shadow-sm
        hover:shadow-md focus:outline-none focus:ring-2
        focus:ring-offset-2 ${currentColor.focusRing}
        disabled:cursor-not-allowed disabled:opacity-60
        group relative overflow-hidden
        ${!isComingSoon ? currentColor.border + " cursor-pointer" : ""}
        ${isLoading ? "cursor-wait" : ""}
      `}
      aria-label={isComingSoon ? `${title} (Coming Soon)` : title}
      aria-describedby={`desc-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div
            className={`w-6 h-6 border-2 ${currentColor.spinnerBase} ${currentColor.spinnerTop} rounded-full animate-spin`}
          />
        </div>
      )}

      {/* Icon container */}
      <div
        className={`p-3 rounded-lg mb-4 transition-colors ${currentColor.bg} self-center sm:self-start`}
      >
        <div
          className={`transition-transform group-hover:scale-110 ${isLoading ? "opacity-30" : ""}`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity ${isLoading ? "opacity-30" : ""}`}>
        <h2 className="text-center sm:text-left font-bold text-lg text-gray-800 mb-2">
          {title}
        </h2>
        <p
          id={`desc-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-center sm:text-left text-gray-600 text-sm px-4 sm:px-0 mb-4"
        >
          {description}
        </p>

        {!isComingSoon ? (
          <div
            className={`${currentColor.text} text-sm font-medium flex items-center gap-1 transition-colors w-full justify-center sm:justify-start`}
          >
            <span>Start Creating</span>
            <ArrowRight
              className={`w-4 h-4 transition-transform ${isLoading ? "opacity-0" : "group-hover:translate-x-1"}`}
            />
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-gray-100 rounded-full inline-flex justify-center sm:justify-start">
            Coming Soon
          </span>
        )}
      </div>
    </button>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const cards = [
    {
      id: 1,
      title: "Create Offer",
      description: "Craft compelling deals and discounts",
      icon: <Tag className="w-10 h-10" />,
      color: "emerald" as const,
      href: "/vendor/dashboard/create-offer",
    },
    {
      id: 2,
      title: "Create Advertisement",
      description: "Promote your business to wider audience",
      icon: <PlusCircle className="w-10 h-10" />,
      color: "blue" as const,
      href: "/vendor/dashboard/create-advertisement",
    },
    {
      id: 3,
      title: "Available Offers & Ads",
      description: "Review your active offers and advertisements",
      icon: <BiSolidOffer className="w-10 h-10" />,
      color: "emerald" as const,
      href: "/vendor/dashboard/offers",
    },
  ];

  return (
    <div className="w-full h-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Manage your business promotions and advertisements
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
        {cards.map((card) => (
          <DashboardCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            color={card.color}
            href={card.href}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
