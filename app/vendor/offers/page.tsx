"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Offer = {
  _id: string;
  title: string;
  description: string;
  offerType: "bogo" | "percentage" | "flat";
  discountValue: number;
  location: string;
  activeDays: string[];
  validUntil: string;
  redemptionLimit: string;
  imageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string;
  createdAt: string;
};

type Advertisement = {
  _id: string;
  title: string;
  content: string;
  advertisementType: "banner" | "sidebar" | "popup";
  imageUrl: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "STOPPED";
  isPaid?: boolean;
  paidFrom?: string;
  paidThrough?: string;
  reviewNote?: string;
  stopNote?: string;
  createdAt: string;
};

const offerStatusClassMap: Record<Offer["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusClassMap: Record<Advertisement["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  STOPPED: "bg-gray-100 text-gray-700",
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

export default function Offers() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingAdId, setPayingAdId] = useState<string | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const [offersRes, adsRes] = await Promise.all([
        fetch(`${apiUrl}/api/offers/me`, {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch(`${apiUrl}/api/advertisements/me`, {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      const offersData = await offersRes.json();
      const adsData = await adsRes.json();

      if (!offersRes.ok) {
        throw new Error(offersData?.message || "Failed to load offers");
      }
      if (!adsRes.ok) {
        throw new Error(adsData?.message || "Failed to load advertisements");
      }

      setOffers(offersData.offers || []);
      setAds(adsData.advertisements || []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load offers and advertisements",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const goToEdit = (advertisementId: string) => {
    router.push(`/vendor/advertisements/${advertisementId}/edit`);
  };

  const startPayment = async (advertisementId: string) => {
    setPayingAdId(advertisementId);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-advertisement-checkout-session`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ advertisementId }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to start payment");
      }

      const url = String(data?.url || "").trim();
      if (!url) {
        throw new Error("Payment session created but missing checkout url");
      }

      window.location.href = url;
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Failed to start payment",
      );
    } finally {
      setPayingAdId(null);
    }
  };

  const deleteAdvertisement = async (advertisementId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advertisement?",
    );
    if (!confirmed) return;

    setDeletingAdId(advertisementId);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/advertisements/${advertisementId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete advertisement");
      }

      await fetchAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete advertisement",
      );
    } finally {
      setDeletingAdId(null);
    }
  };

  const deleteOffer = async (offerId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?",
    );
    if (!confirmed) return;

    setDeletingOfferId(offerId);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const response = await fetch(`${apiUrl}/api/offers/${offerId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete offer");
      }

      await fetchAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete offer",
      );
    } finally {
      setDeletingOfferId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Offers & Advertisements
        </h1>
        <p className="text-sm text-gray-600">
          Track pending, approved, and rejected offers and advertisements.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Loading offers and advertisements...
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Offers</h2>

            {offers.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
                No offers submitted yet.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {offers.map((offer) => (
                  <div
                    key={offer._id}
                    className="rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="h-48 w-full rounded-t-xl object-cover"
                    />

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {offer.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(offer.createdAt).toLocaleDateString()} •{" "}
                            {offer.offerType.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Valid until: {formatDate(offer.validUntil)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${offerStatusClassMap[offer.status]}`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700">{offer.description}</p>

                      <div className="flex gap-2">
                        {offer.status !== "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => deleteOffer(offer._id)}
                            disabled={deletingOfferId === offer._id}
                            className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingOfferId === offer._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>

                      {offer.status === "REJECTED" && (
                        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Reason:</span>{" "}
                            {offer.reviewNote || "No reason was provided."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Advertisements</h2>

            {ads.length === 0 ? (
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ad.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(ad.createdAt).toLocaleDateString()} •{" "}
                            {ad.advertisementType}
                          </p>
                          <p className="text-xs text-gray-500">
                            Schedule: {formatDate(ad.startDate)} —{" "}
                            {formatDate(ad.endDate)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[ad.status]}`}
                          >
                            {ad.status}
                          </span>
                          {ad.isPaid === false && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                              PAYMENT REQUIRED
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700">{ad.content}</p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => goToEdit(ad._id)}
                          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        {ad.isPaid === false && (
                          <button
                            type="button"
                            onClick={() => startPayment(ad._id)}
                            disabled={payingAdId === ad._id}
                            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {payingAdId === ad._id
                              ? "Starting..."
                              : "Pay for Dates"}
                          </button>
                        )}

                        {ad.status !== "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => deleteAdvertisement(ad._id)}
                            disabled={deletingAdId === ad._id}
                            className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingAdId === ad._id ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>

                      {ad.status === "REJECTED" && (
                        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">Reason:</span>{" "}
                            {ad.reviewNote || "No reason was provided."}
                          </p>
                        </div>
                      )}

                      {ad.status === "STOPPED" && ad.stopNote && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                          <span className="font-medium">Stopped:</span>{" "}
                          {ad.stopNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
