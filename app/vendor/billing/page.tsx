"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type PlanKey = "bronze" | "silver" | "gold";

type SubscriptionPlan = {
  key: PlanKey;
  name: string;
  currency: string;
  priceCents: number;
};

type VendorSubscription = {
  planKey?: PlanKey;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

type VendorProfileResponse = {
  success: boolean;
  user?: {
    vendorSubscription?: VendorSubscription;
  };
  message?: string;
};

type PlansResponse = {
  success: boolean;
  plans?: SubscriptionPlan[];
  checkoutAvailable?: boolean;
  message?: string;
};

const isActiveStatus = (status?: string) =>
  status === "active" || status === "trialing";

const formatPrice = (cents: number, currency: string) => {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
};

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const sessionId = useMemo(
    () => String(searchParams?.get("session_id") || "").trim(),
    [searchParams],
  );
  const isSuccess = useMemo(
    () => String(searchParams?.get("success") || "").trim() === "1",
    [searchParams],
  );
  const isCanceled = useMemo(
    () => String(searchParams?.get("canceled") || "").trim() === "1",
    [searchParams],
  );
  const nextPath = useMemo(
    () => String(searchParams?.get("next") || "").trim(),
    [searchParams],
  );

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkoutAvailable, setCheckoutAvailable] = useState(true);
  const [profile, setProfile] = useState<VendorSubscription | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOutKey, setCheckingOutKey] = useState<PlanKey | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const res = await fetch(
        `${apiUrl}/api/payment/subscription-plans`,
        { headers: { "Cache-Control": "no-cache" } },
      );
      const data = (await res.json()) as PlansResponse;
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to load plans");
      }
      setPlans(data.plans || []);
      setCheckoutAvailable(data.checkoutAvailable !== false);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const res = await fetch(
        `${apiUrl}/api/vendor/profile`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        },
      );
      const data = (await res.json()) as VendorProfileResponse;
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to load profile");
      }
      setProfile(data.user?.vendorSubscription || null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    setError(null);

    const run = async () => {
      try {
        await Promise.all([fetchPlans(), fetchProfile()]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load billing data");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSuccess || !sessionId) return;

    const confirm = async () => {
      setConfirming(true);
      setConfirmMessage("Confirming your subscription...");
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payment/confirm-subscription-checkout-session`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          },
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.message || "Failed to confirm subscription");
        }

        await fetchProfile();
        setConfirmMessage("Subscription active.");

        const nowStatus = String(data?.vendorSubscription?.status || "").trim();
        if (nextPath && isActiveStatus(nowStatus)) {
          router.replace(nextPath);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to confirm subscription");
        setConfirmMessage(null);
      } finally {
        setConfirming(false);
      }
    };

    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, sessionId]);

  const startCheckout = async (planKey: PlanKey) => {
    setCheckingOutKey(planKey);
    setError(null);

    try {
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      if (!checkoutAvailable) {
        throw new Error(
          "Stripe checkout is not available. Configure STRIPE_SECRET_KEY on the backend.",
        );
      }

      const res = await fetch(
        `${apiUrl}/api/payment/create-subscription-checkout-session`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planKey }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to start checkout");
      }

      const url = String(data?.url || "").trim();
      if (!url) {
        throw new Error("Checkout session created but missing url");
      }

      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start checkout");
    } finally {
      setCheckingOutKey(null);
    }
  };

  const active = isActiveStatus(profile?.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-600">
          Choose a subscription plan to create offers and advertisements.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Payment method details are entered on Stripe Checkout after you click
          Subscribe.
        </p>
      </div>

      {(error || isCanceled) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Checkout canceled."}
        </div>
      )}

      {(confirming || confirmMessage) && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {confirmMessage || ""}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Current plan</h2>
            {loadingProfile ? (
              <p className="text-sm text-gray-600">Loading...</p>
            ) : active ? (
              <p className="text-sm text-gray-700">
                {String(profile?.planKey || "").toUpperCase()} • {profile?.status}
              </p>
            ) : (
              <p className="text-sm text-gray-700">No active subscription.</p>
            )}
          </div>

          {nextPath && (
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loadingPlans ? (
          <div className="md:col-span-3 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="md:col-span-3 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            No plans available.
          </div>
        ) : (
          plans.map((plan) => {
            const isCurrent =
              active && profile?.planKey && profile.planKey === plan.key;

            return (
              <div
                key={plan.key}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(plan.priceCents, plan.currency)} / month
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    disabled={active || !checkoutAvailable}
                    onClick={() => startCheckout(plan.key)}
                    className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      active || !checkoutAvailable
                        ? "cursor-not-allowed bg-gray-100 text-gray-500"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {active
                      ? isCurrent
                        ? "Active"
                        : "Subscription active"
                      : !checkoutAvailable
                        ? "Checkout unavailable"
                      : checkingOutKey === plan.key
                        ? "Redirecting..."
                        : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
