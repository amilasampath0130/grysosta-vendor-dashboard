"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Information() {
  //personal details
  const [FirstName, setFirstName] = useState("");
  const [middName, setMiddleName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Address, setAddress] = useState("");
  const [City, setCity] = useState("");
  const [State, setState] = useState("");
  const [ZipCode, setZipCode] = useState("");
  //business details
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [buscategory, setBuscategory] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [UserIDDoc, setUserIDDoc] = useState<File | null>(null);
  const [BusinessRegDoc, setBusinessRegDoc] = useState<File | null>(null);
  const [typeofoffering, setTypeofoffering] = useState("");
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState("");
  //contact details
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (loading) return;

    // Basic validation
    if (!FirstName.trim() || !LastName.trim() || !businessName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/submit-info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName: FirstName,
            middleName: middName,
            lastName: LastName,
            address: Address,
            city: City,
            state: State,
            zipCode: ZipCode,
            businessName,
            businessType,
            businessCategory: buscategory,
            businessAddress,
            businessPhoneNumber,
            email,
            phoneNumber,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        router.push("/vendor/pending");
      } else {
        setError(data.message || "Submission failed");
      }
    } catch (err: any) {
      setError("Server error. Please try again.");
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
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Still redirect
      router.push("/auth/login");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Vendor Information</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <form className="space-y-4">
          <p className="text-gray-600 mb-2 font-bold">
            please provide personal details to continue.
          </p>
          <div className=" grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2">
            <input
              type="text"
              value={FirstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={middName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Middle Name"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={LastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <input
            type="text"
            value={Address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2">
            <input
              type="text"
              value={City}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={State}
              onChange={(e) => setState(e.target.value)}
              placeholder="State/Province/Region"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={ZipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="ZIP/Postal Code"
              className="w-full p-2 border border-gray-300 rounded "
            />
          </div>
          <p className="text-gray-600 mb-6 font-bold">
            Please provide your business details to continue.
          </p>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Business Name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="Business Type"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={buscategory}
            onChange={(e) => setBuscategory(e.target.value)}
            placeholder="Business Category"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <textarea
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            placeholder="Business Address"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={typeofoffering}
            onChange={(e) => setTypeofoffering(e.target.value)}
            placeholder="Type of Offering"
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="number"
            value={businessPhoneNumber}
            onChange={(e) => setBusinessPhoneNumber(e.target.value)}
            placeholder="Business Phone Number"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="grid lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-1 gap-2">
            <p className="flex items-start justify-start text-start text-gray-700 font-bold">
              Upload a valid government-issued ID (e.g., passport, driver's
              license).
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUserIDDoc(e.target.files[0]);
                }
              }}
              className="w-full p-2 border-2 border-red-400 rounded"
            />
            <p className="flex items-start justify-start text-start text-gray-700 font-bold">
              Upload a valid business registration document (e.g., business
              license, tax registration).
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setBusinessRegDoc(e.target.files[0]);
                }
              }}
              className="w-full p-2 border-2 border-red-400 rounded"
            />
          </div>
          <p className="text-gray-600 mb-6 font-bold">
            Please provide your contact details to continue.
          </p>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring focus:ring-green-500 focus:ring-opacity-50 active:bg-green-800 active:text-white active:shadow-inner active:ring active:ring-green-50 active:ring-opacity-50 disabled:bg-gray-400 disabled:text-gray-70 disabled:cursor-not-allowered disabled:hover:bg-gray-40 disabled:hover:text-gray disabled:hover:cursor-not-allowered disabled:focus:outline-none disabled:focus:ring disabled:focus:ring-green disabled:focus:ring-opacity-disabled:focus:border-transparent disabled:focus:border-transparent "
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
