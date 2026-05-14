"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberSignup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    shopName: "",
    services: [],
    shopImage: "", // Changed to string for URL
    barberImage: "", // Changed to string for URL
    aadharNumber: "",
    dob: "",
    gender: "",
    aadharFront: "", // Changed to string for URL
    aadharBack: "", // Changed to string for URL
    selfieWithAadhar: "", // Changed to string for URL
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const servicesList = [
    "Haircut", "Spa", "Beardset", "Hairwash", 
    "Facewash", "Men", "Women", "Children (18-)",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedServices = [...formData.services];
    if (checked) {
      updatedServices.push(value);
    } else {
      updatedServices = updatedServices.filter((s) => s !== value);
    }
    setFormData({ ...formData, services: updatedServices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get GPS Coordinates
      const getCoords = () =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );

      const coords = await getCoords();
      const lat = coords.coords.latitude;
      const lng = coords.coords.longitude;

      // 1. THE JSON PAYLOAD: Pure, clean object. No FormData streams!
      const payload = {
        ...formData,
        lat,
        lng
      };

      // 2. THE FETCH: Notice we added headers for application/json
      const res = await fetch("/api/barbershop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/barberLogin`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 text-slate-200 shadow-xl rounded-2xl p-8 w-[600px] relative mt-3"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
          Barber Shop Registration
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="p-2 border border-slate-600 bg-slate-700 rounded w-full"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="p-2 border border-slate-600 bg-slate-700 rounded w-full"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="E-Mail"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded"
          required
        />

        {/* Shop Info */}
        <input
          type="text"
          name="shopName"
          placeholder="Shop Name"
          value={formData.shopName}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-slate-600 bg-slate-700 rounded"
          required
        />

        {/* Services */}
        <label className="block mb-2 font-medium text-slate-300">Services Offered</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {servicesList.map((service) => (
            <label key={service} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                value={service}
                checked={formData.services.includes(service)}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded text-red-500 focus:ring-red-500 bg-slate-700 border-slate-600"
              />
              {service}
            </label>
          ))}
        </div>

        {/* URL Uploads Instead of Files */}
        <label className="block mb-1 font-medium text-sm text-slate-300">Shop Image URL (Optional)</label>
        <input
          type="url"
          name="shopImage"
          placeholder="https://..."
          value={formData.shopImage}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded text-sm"
        />

        <label className="block mb-1 font-medium text-sm text-slate-300">Barber Image URL (Optional)</label>
        <input
          type="url"
          name="barberImage"
          placeholder="https://..."
          value={formData.barberImage}
          onChange={handleChange}
          className="w-full mb-6 p-2 border border-slate-600 bg-slate-700 rounded text-sm"
        />

        {/* ✅ KYC Section */}
        <h3 className="text-xl font-semibold mb-4 text-red-500 border-t border-slate-600 pt-6">
          KYC Verification (Mandatory)
        </h3>

        <input
          type="text"
          name="aadharNumber"
          placeholder="Aadhar Number (12 digits)"
          value={formData.aadharNumber}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded"
          required
        />

        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded text-slate-300"
          required
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full mb-4 p-2 border border-slate-600 bg-slate-700 rounded text-slate-300"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label className="block mb-1 font-medium text-sm text-slate-300">Aadhar Front URL (Required)</label>
        <input
          type="url"
          name="aadharFront"
          placeholder="https://..."
          value={formData.aadharFront}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded text-sm"
          required
        />

        <label className="block mb-1 font-medium text-sm text-slate-300">Aadhar Back URL (Required)</label>
        <input
          type="url"
          name="aadharBack"
          placeholder="https://..."
          value={formData.aadharBack}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded text-sm"
          required
        />

        <label className="block mb-1 font-medium text-sm text-slate-300">Selfie with Aadhar URL (Optional)</label>
        <input
          type="url"
          name="selfieWithAadhar"
          placeholder="https://..."
          value={formData.selfieWithAadhar}
          onChange={handleChange}
          className="w-full mb-8 p-2 border border-slate-600 bg-slate-700 rounded text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 py-3 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Shop"}
        </button>
      </form>
    </div>
  );
}