"use client";
import { useRouter } from "next/navigation";

import { useState } from "react";

export default function CreateOffer() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const[offerType, setOfferType] = useState("bogo");
    const[discountValue, setDiscountValue] = useState(0);
    const[location, setLocation] = useState("all");
    const[activeDays, setActiveDays] = useState<string[]>([]);
    const[validUntil, setValidUntil] = useState("");
    const[redemptionLimit, setRedemptionLimit] = useState("once_per_user");
    const[image, setImage] = useState<File | null>(null);


    

  const router = useRouter();

  const handleSubmit = async () => {
    // Handle form submission logic here
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Create Offer</h1>

        <form className="space-y-4">
          {/* Offer Title */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Offer Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            />
          </div>

          {/* Offer Type */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Offer Type
            </label>
            <select
              name="offerType"
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            >
              <option value="bogo">Buy One Get One</option>
              <option value="percentage">Percentage Discount</option>
              <option value="flat">Flat Discount</option>
            </select>
          </div>

          {/* Discount Value */}
          {offerType !== "bogo" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">
                Discount Value
              </label>
              <input
                name="discountValue"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full border text-gray-600 p-2 border-green-500 rounded"
              />
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Location</label>
            <select
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            >
              <option value="all">All Locations</option>
              <option value="single">Selected Location</option>
            </select>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Valid Until
            </label>
            <input
              type="date"
              name="validUntil"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border p-2 border-green-500 rounded text-gray-600 hover:border-green-700"
            />
          </div>

          {/* Redemption Limit */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Redemption Limit
            </label>
            <select
              name="redemptionLimit"
              value={redemptionLimit}
              onChange={(e) => setRedemptionLimit(e.target.value)}
              className="w-full border text-gray-600 p-2 border-green-500 rounded"
            >
              <option value="once_per_user">Once per User</option>
              <option value="once_per_day">Once per Day</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
          {/* Submit */}
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Create Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
