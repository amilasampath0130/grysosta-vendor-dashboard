"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import {
  ArrowRight,
  BellRing,
  Coins,
  CreditCard,
  Eye,
  Gauge,
  Gift,
  Megaphone,
  PlusCircle,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { BiSolidOffer } from "react-icons/bi";

type BannerState = {
  kind: "success" | "error" | "info";
  message: string;
} | null;

type PlanKey = "bronze" | "silver" | "gold" | "diamond";

type VendorBillingPlan = {
  key: PlanKey;
  name: string;
  currency: string;
  priceCents: number;
  summary: string;
  features: string[];
  limits: {
    activeOfferLimit: number | null;
    advertisementLimit: number | null;
  };
};

type VendorBilling = {
  activePlan: VendorBillingPlan | null;
  recommendedPlan: VendorBillingPlan | null;
  usage: {
    activeOfferCount: number;
    pendingOfferCount: number;
    occupiedOfferCount: number;
    activeAdvertisementCount: number;
    pendingAdvertisementCount: number;
    occupiedAdvertisementCount: number;
  };
};

type VendorProfileResponse = {
  success: boolean;
  user?: {
    name?: string;
    vendorSubscription?: {
      planKey?: PlanKey;
      status?: string;
    };
    vendorBilling?: VendorBilling;
    vendorApplication?: {
      business?: {
        businessName?: string;
        planKey?: PlanKey;
        vacayCoinParticipation?: boolean;
      };
    };
  };
  message?: string;
};

type Offer = {
  _id: string;
  title: string;
  description: string;
  offerType: "bogo" | "percentage" | "flat";
  discountValue: number;
  redemptionLimit: string;
  validUntil: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

type Advertisement = {
  _id: string;
  title: string;
  advertisementType: "banner" | "sidebar" | "popup";
  status: "PENDING" | "APPROVED" | "REJECTED" | "STOPPED";
  isPaid?: boolean;
  endDate?: string;
  createdAt: string;
};

type OfferResponse = {
  success: boolean;
  offers?: Offer[];
  message?: string;
};

type AdvertisementResponse = {
  success: boolean;
  advertisements?: Advertisement[];
  message?: string;
};

type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  tone: "emerald" | "amber" | "blue" | "red";
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const formatRelativeTime = (value?: string) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffHours = Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return `${Math.floor(diffDays / 30)}mo ago`;
};

const formatCurrency = (cents?: number, currency?: string) => {
  const amount = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

const getOfferStrengthScore = (offer: Offer) => {
  const statusWeight = offer.status === "APPROVED" ? 50 : offer.status === "PENDING" ? 20 : 0;
  const typeWeight = offer.offerType === "bogo" ? 35 : offer.offerType === "percentage" ? 25 : 18;
  return statusWeight + typeWeight + Math.min(offer.discountValue || 0, 40);
};

const toneClasses: Record<ActivityItem["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
};

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="rounded-full bg-gray-100 p-2 text-gray-600">{icon}</span>
      </div>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
      <p className="mt-2 text-sm text-gray-500">{hint}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  href,
  accent,
  primary = false,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  accent: "emerald" | "blue" | "slate";
  primary?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const accentClasses = {
    emerald: primary
      ? "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
      : "border-emerald-200 bg-white text-gray-900 hover:border-emerald-300",
    blue: "border-blue-200 bg-white text-gray-900 hover:border-blue-300",
    slate: "border-gray-200 bg-white text-gray-900 hover:border-gray-300",
  };

  const iconClasses = {
    emerald: primary ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-gray-50 text-gray-600",
  };

  return (
    <button
      type="button"
      onClick={() => {
        if (isLoading) return;
        setIsLoading(true);
        router.push(href);
        setTimeout(() => setIsLoading(false), 1200);
      }}
      className={`rounded-2xl border p-5 text-left shadow-sm transition-all ${accentClasses[accent]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-2xl p-3 ${iconClasses[accent]}`}>{icon}</div>
        <ArrowRight className={`mt-1 h-5 w-5 ${primary ? "text-white" : "text-gray-400"}`} />
      </div>
      <h2 className={`mt-5 text-lg font-semibold ${primary ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      <p className={`mt-2 text-sm ${primary ? "text-emerald-50" : "text-gray-600"}`}>
        {description}
      </p>
      <div className={`mt-4 text-sm font-medium ${primary ? "text-white" : "text-gray-700"}`}>
        {isLoading ? "Opening..." : "Open"}
      </div>
    </button>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentBanner, setPaymentBanner] = useState<BannerState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VendorProfileResponse["user"] | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "cancel") {
      setPaymentBanner({
        kind: "info",
        message: "Subscription checkout cancelled.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = getApiBaseUrl();
        if (!apiUrl) {
          throw new Error("API URL is not configured.");
        }

        const [profileRes, offersRes, adsRes] = await Promise.all([
          fetch(`${apiUrl}/api/vendor/profile`, {
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          }),
          fetch(`${apiUrl}/api/offers/me`, {
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          }),
          fetch(`${apiUrl}/api/advertisements/me`, {
            credentials: "include",
            headers: { "Cache-Control": "no-cache" },
          }),
        ]);

        const profileData = (await profileRes.json()) as VendorProfileResponse;
        const offersData = (await offersRes.json()) as OfferResponse;
        const adsData = (await adsRes.json()) as AdvertisementResponse;

        if (!profileRes.ok || !profileData.success) {
          throw new Error(profileData.message || "Failed to load profile");
        }
        if (!offersRes.ok || !offersData.success) {
          throw new Error(offersData.message || "Failed to load offers");
        }
        if (!adsRes.ok || !adsData.success) {
          throw new Error(adsData.message || "Failed to load advertisements");
        }

        setProfile(profileData.user || null);
        setOffers(offersData.offers || []);
        setAds(adsData.advertisements || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activePlan = profile?.vendorBilling?.activePlan;
  const usage = profile?.vendorBilling?.usage;
  const businessName = profile?.vendorApplication?.business?.businessName || profile?.name || "Vendor";
  const vacayCoinEnabled = profile?.vendorApplication?.business?.vacayCoinParticipation === true;

  const activeOffers = useMemo(() => offers.filter((offer) => offer.status === "APPROVED"), [offers]);
  const pendingOffers = useMemo(() => offers.filter((offer) => offer.status === "PENDING"), [offers]);
  const approvedAds = useMemo(() => ads.filter((ad) => ad.status === "APPROVED"), [ads]);
  const pendingAds = useMemo(() => ads.filter((ad) => ad.status === "PENDING"), [ads]);

  const topOffer = useMemo(() => {
    const ranked = [...offers].sort((left, right) => getOfferStrengthScore(right) - getOfferStrengthScore(left));
    return ranked[0] || null;
  }, [offers]);

  const estimatedViews = useMemo(() => activeOffers.length * 120 + approvedAds.length * 260, [activeOffers.length, approvedAds.length]);
  const estimatedRedemptions = useMemo(() => {
    const cappedOffers = activeOffers.filter((offer) => offer.redemptionLimit !== "unlimited").length;
    return activeOffers.length * 8 + cappedOffers * 3;
  }, [activeOffers]);

  const alerts = useMemo(() => {
    const nextAlerts: Array<{ title: string; detail: string; tone: "amber" | "blue" | "emerald" }> = [];

    if (usage && activePlan) {
      const offerLimit = activePlan.limits.activeOfferLimit;
      const adLimit = activePlan.limits.advertisementLimit;

      if (offerLimit !== null && usage.occupiedOfferCount >= Math.max(offerLimit - 1, 1)) {
        nextAlerts.push({
          title: "Offer capacity nearly full",
          detail: `${usage.occupiedOfferCount}/${offerLimit} offer slots are occupied on ${activePlan.name}.`,
          tone: "amber",
        });
      }

      if (adLimit !== null && usage.occupiedAdvertisementCount >= Math.max(adLimit - 1, 1)) {
        nextAlerts.push({
          title: "Ad capacity nearly full",
          detail: `${usage.occupiedAdvertisementCount}/${adLimit} advertisement slots are occupied.`,
          tone: "amber",
        });
      }
    }

    if (pendingOffers.length > 0 || pendingAds.length > 0) {
      nextAlerts.push({
        title: "Pending approvals",
        detail: `${pendingOffers.length} offers and ${pendingAds.length} advertisements are waiting for review.`,
        tone: "blue",
      });
    }

    if (nextAlerts.length === 0) {
      nextAlerts.push({
        title: "All clear",
        detail: "No urgent billing or approval alerts right now.",
        tone: "emerald",
      });
    }

    return nextAlerts;
  }, [activePlan, pendingAds.length, pendingOffers.length, usage]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const offerItems: ActivityItem[] = offers.map((offer) => ({
      id: `offer-${offer._id}`,
      label: offer.title,
      detail:
        offer.status === "APPROVED"
          ? "Offer approved and live"
          : offer.status === "PENDING"
            ? "Offer submitted for review"
            : "Offer needs changes",
      timestamp: offer.createdAt,
      tone:
        offer.status === "APPROVED"
          ? "emerald"
          : offer.status === "PENDING"
            ? "amber"
            : "red",
    }));

    const adItems: ActivityItem[] = ads.map((ad) => ({
      id: `ad-${ad._id}`,
      label: ad.title,
      detail:
        ad.status === "APPROVED"
          ? "Advertisement approved"
          : ad.status === "PENDING"
            ? "Advertisement pending review"
            : ad.status === "STOPPED"
              ? "Advertisement stopped"
              : "Advertisement rejected",
      timestamp: ad.createdAt,
      tone:
        ad.status === "APPROVED"
          ? "emerald"
          : ad.status === "PENDING"
            ? "blue"
            : "red",
    }));

    return [...offerItems, ...adItems]
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
      .slice(0, 6);
  }, [ads, offers]);

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Vendor control center</p>
            <h1 className="mt-2 text-3xl font-semibold">{businessName}</h1>
            <p className="mt-3 max-w-2xl text-sm text-emerald-50">
              Keep your plan healthy, launch high-priority offers, and track what needs attention today.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[740px]">
            <ActionCard
              title="Create Offer"
              description="Launch the next promotion fast. This is the primary action for growth."
              icon={<Tag className="h-6 w-6" />}
              href="/vendor/dashboard/create-offer"
              accent="emerald"
              primary
            />
            <ActionCard
              title="Create Advertisement"
              description="Boost visibility with a targeted advertisement placement."
              icon={<PlusCircle className="h-6 w-6" />}
              href="/vendor/dashboard/create-advertisement"
              accent="blue"
            />
            <ActionCard
              title="Offers & Ads"
              description="Review approvals, live campaigns, and pending items."
              icon={<BiSolidOffer className="h-6 w-6" />}
              href="/vendor/offers"
              accent="slate"
            />
          </div>
        </div>
      </div>

      {paymentBanner && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            paymentBanner.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : paymentBanner.kind === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {paymentBanner.message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Estimated Views"
          value={loading ? "..." : estimatedViews.toLocaleString()}
          hint="Simple dashboard estimate based on your live offers and ads."
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          label="Estimated Redemptions"
          value={loading ? "..." : estimatedRedemptions.toLocaleString()}
          hint="Quick indicator until full redemption tracking is added."
          icon={<Gift className="h-5 w-5" />}
        />
        <MetricCard
          label="Active Promotions"
          value={loading ? "..." : String(activeOffers.length + approvedAds.length)}
          hint="Approved offers and advertisements currently carrying your brand."
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          label="Pending Reviews"
          value={loading ? "..." : String(pendingOffers.length + pendingAds.length)}
          hint="Items waiting for admin review or payment follow-up."
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan Status</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">{activePlan?.name || "No active plan"}</h2>
                <p className="mt-2 text-sm text-gray-600">
                  {activePlan
                    ? `${formatCurrency(activePlan.priceCents, activePlan.currency)} / month`
                    : "Activate billing to unlock offers and advertisement slots."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/vendor/billing")}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Manage billing
              </button>
            </div>

            {activePlan && usage && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Offer usage</span>
                    <span>
                      {usage.occupiedOfferCount}/{activePlan.limits.activeOfferLimit ?? "Unlimited"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width:
                          activePlan.limits.activeOfferLimit === null
                            ? "35%"
                            : `${Math.min(100, (usage.occupiedOfferCount / activePlan.limits.activeOfferLimit) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Ad usage</span>
                    <span>
                      {usage.occupiedAdvertisementCount}/{activePlan.limits.advertisementLimit ?? "Unlimited"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width:
                          activePlan.limits.advertisementLimit === null
                            ? "35%"
                            : `${Math.min(100, (usage.occupiedAdvertisementCount / activePlan.limits.advertisementLimit) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Top Performing Offer</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">{topOffer?.title || "No offers yet"}</h2>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                {topOffer ? "Highlighted" : "Create one"}
              </span>
            </div>

            {topOffer ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="text-sm text-gray-600">{topOffer.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {topOffer.offerType === "bogo"
                        ? "BOGO"
                        : topOffer.offerType === "percentage"
                          ? `${topOffer.discountValue}% off`
                          : `$${topOffer.discountValue} off`}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {topOffer.status}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Valid until {formatDate(topOffer.validUntil)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Why it stands out</p>
                  <ul className="mt-3 space-y-2">
                    <li>Strong discount signal for customers</li>
                    <li>Weighted toward approved and review-ready offers</li>
                    <li>Good candidate for your next push</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600">
                Create your first offer to get a featured performance spotlight here.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Vacay Coin</p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {vacayCoinEnabled ? "Participation enabled" : "Participation not enabled"}
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                {vacayCoinEnabled
                  ? "Your business is marked to participate in Vacay Coin. Keep offers active so you are ready for future reward-based discovery."
                  : "Vacay Coin participation is currently off on your vendor profile. Enable it during onboarding or profile updates when that flow is available."}
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-medium">Simple next step</p>
                <p className="mt-2">
                  {vacayCoinEnabled
                    ? "Use Create Offer as the main growth action so your business stays ready for future reward campaigns."
                    : "When profile editing is available, turn on Vacay Coin participation and keep at least one approved offer live."}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <BellRing className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Alerts & Notifications</p>
                <h2 className="text-xl font-semibold text-gray-900">Attention needed</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{alert.detail}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        alert.tone === "amber"
                          ? "bg-amber-100 text-amber-700"
                          : alert.tone === "blue"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {alert.tone === "amber" ? "Watch" : alert.tone === "blue" ? "Info" : "Good"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gray-100 p-3 text-gray-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <h2 className="text-xl font-semibold text-gray-900">Latest movement</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {recentActivity.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  No recent activity yet. Create an offer to get your dashboard moving.
                </div>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-gray-200 p-4">
                    <span className={`mt-0.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[item.tone]}`}>
                      {item.tone === "emerald"
                        ? "Live"
                        : item.tone === "amber"
                          ? "Pending"
                          : item.tone === "blue"
                            ? "Update"
                            : "Issue"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="mt-1 text-sm text-gray-600">{item.detail}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatRelativeTime(item.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quick Summary</p>
                <h2 className="text-xl font-semibold text-gray-900">Today at a glance</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span>Current plan</span>
                <span className="font-medium text-gray-900">{activePlan?.name || "Inactive"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span>Live offers</span>
                <span className="font-medium text-gray-900">{activeOffers.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span>Paid/approved ads</span>
                <span className="font-medium text-gray-900">{approvedAds.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span>Primary CTA</span>
                <span className="font-medium text-emerald-700">Create Offer</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/vendor/dashboard/create-offer")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Megaphone className="h-4 w-4" />
              Create Offer Now
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
