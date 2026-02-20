"use client";

import { useEffect, useState } from "react";

type Advertisement = {
  _id: string;
  title: string;
  content: string;
  advertisementType: "banner" | "sidebar" | "popup";
  imageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string;
  createdAt: string;
};

const statusClassMap: Record<Advertisement["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function Offers() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/advertisements/me`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load advertisements");
      }

      setAds(data.advertisements || []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load advertisements",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const resubmitAdvertisement = async (advertisementId: string) => {
    setBusyId(advertisementId);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/advertisements/resubmit/${advertisementId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to resubmit advertisement");
      }

      await fetchAds();
    } catch (resubmitError) {
      setError(
        resubmitError instanceof Error
          ? resubmitError.message
          : "Failed to resubmit advertisement",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Advertisements</h1>
        <p className="text-sm text-gray-600">
          Track pending, approved, and rejected advertisements.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Loading advertisements...
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          No advertisements submitted yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {ads.map((ad) => (
            <div
              key={ad._id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="h-48 w-full rounded-t-xl object-cover"
              />

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {ad.title}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {new Date(ad.createdAt).toLocaleDateString()} •{" "}
                      {ad.advertisementType}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[ad.status]}`}
                  >
                    {ad.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700">{ad.content}</p>

                {ad.status === "REJECTED" && (
                  <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Reason:</span>{" "}
                      {ad.reviewNote || "No reason was provided."}
                    </p>
                    <button
                      type="button"
                      onClick={() => resubmitAdvertisement(ad._id)}
                      disabled={busyId === ad._id}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === ad._id ? "Resubmitting..." : "Submit Again"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
