"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/api";

type CoinCatalogItem = {
  id: string;
  name: string;
  code: string;
  description: string;
  imageUrl: string;
  progressTarget: number;
  isActive: boolean;
};

type InventoryItem = {
  id: string;
  availableQuantity: number;
  rewardMin: number;
  rewardMax: number;
  isActive: boolean;
  updatedAt: string;
  coinType: CoinCatalogItem;
};

type CatalogResponse = {
  success?: boolean;
  message?: string;
  coins?: CoinCatalogItem[];
};

type InventoryResponse = {
  success?: boolean;
  message?: string;
  inventory?: InventoryItem[];
};

type FormState = {
  coinTypeId: string;
  availableQuantity: string;
  rewardMin: string;
  rewardMax: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  coinTypeId: "",
  availableQuantity: "0",
  rewardMin: "1",
  rewardMax: "10",
  isActive: true,
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

export default function VendorCoinsPage() {
  const [catalog, setCatalog] = useState<CoinCatalogItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const [catalogRes, inventoryRes] = await Promise.all([
        authFetch(`${apiUrl}/api/vendor/coins/catalog`, {
          headers: { "Cache-Control": "no-cache" },
        }),
        authFetch(`${apiUrl}/api/vendor/coins/inventory`, {
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      const [catalogData, inventoryData] = (await Promise.all([
        catalogRes.json(),
        inventoryRes.json(),
      ])) as [CatalogResponse, InventoryResponse];

      if (!catalogRes.ok || !catalogData.success) {
        throw new Error(catalogData.message || "Failed to load coin catalog");
      }
      if (!inventoryRes.ok || !inventoryData.success) {
        throw new Error(inventoryData.message || "Failed to load inventory");
      }

      setCatalog(catalogData.coins || []);
      setInventory(inventoryData.inventory || []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load coins",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const response = await authFetch(`${apiUrl}/api/vendor/coins/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinTypeId: form.coinTypeId,
          availableQuantity: form.availableQuantity,
          rewardMin: form.rewardMin,
          rewardMax: form.rewardMax,
          isActive: form.isActive,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save inventory");
      }

      setForm(emptyForm);
      await fetchAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save inventory",
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setForm({
      coinTypeId: item.coinType.id,
      availableQuantity: String(item.availableQuantity),
      rewardMin: String(item.rewardMin),
      rewardMax: String(item.rewardMax),
      isActive: item.isActive,
    });
  };

  const toggleItem = async (item: InventoryItem) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const response = await authFetch(`${apiUrl}/api/vendor/coins/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinTypeId: item.coinType.id,
          availableQuantity: item.availableQuantity,
          rewardMin: item.rewardMin,
          rewardMax: item.rewardMax,
          isActive: !item.isActive,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update inventory");
      }

      await fetchAll();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update inventory",
      );
    }
  };

  const removeItem = async (inventoryId: string) => {
    const confirmed = window.confirm("Remove this coin inventory entry?");
    if (!confirmed) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured (vendor_dashboard).",
        );
      }

      const response = await authFetch(
        `${apiUrl}/api/vendor/coins/inventory/${inventoryId}`,
        {
          method: "DELETE",
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete inventory");
      }

      await fetchAll();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete inventory",
      );
    }
  };

  const activeCount = useMemo(
    () => inventory.filter((item) => item.isActive).length,
    [inventory],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coin Inventory</h1>
          <p className="text-sm text-gray-600">
            Stock the coin rewards users can randomly win from the mobile daily
            touch.
          </p>
        </div>

        <button
          onClick={() => void fetchAll()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add Or Update Coin Stock
            </h2>
            <p className="text-sm text-gray-600">
              Users can randomly receive any active coin stocked here.
            </p>
          </div>

          <label className="block space-y-1 text-sm text-gray-700">
            <span>Coin Type</span>
            <select
              value={form.coinTypeId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  coinTypeId: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-400"
              required
            >
              <option value="">Select a coin</option>
              {catalog.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.code})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1 text-sm text-gray-700">
              <span>Available Quantity</span>
              <input
                type="number"
                min="0"
                value={form.availableQuantity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    availableQuantity: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-400"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-gray-700">
              <span>Min Reward</span>
              <input
                type="number"
                min="0"
                value={form.rewardMin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rewardMin: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-400"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-gray-700">
              <span>Max Reward</span>
              <input
                type="number"
                min="0"
                value={form.rewardMax}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rewardMax: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-green-400"
                required
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
            Active for random distribution
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Inventory"}
          </button>
        </form>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                My Coin Stock
              </h2>
              <p className="text-sm text-gray-600">
                Active entries: {activeCount}
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {inventory.length === 0 && !loading ? (
              <div className="px-5 py-8 text-sm text-gray-500">
                No coin inventory configured yet.
              </div>
            ) : null}
            {inventory.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={item.coinType.imageUrl}
                    alt={item.coinType.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-xl object-cover"
                    unoptimized
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {item.coinType.name}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        {item.coinType.code}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Stock: {item.availableQuantity} • Reward range:{" "}
                      {item.rewardMin} - {item.rewardMax}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Updated {formatDate(item.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void toggleItem(item)}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                  >
                    {item.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => void removeItem(item.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
