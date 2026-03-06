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
    shopImage: null, // optional
    barberImage: null, // optional
    aadharNumber: "",
    dob: "",
    gender: "",
    aadharFront: null,
    aadharBack: null,
    selfieWithAadhar: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  // suggestions removed since location field no longer exists

  const servicesList = [
    "Haircut",
    "Spa",
    "Beardset",
    "Hairwash",
    "Facewash",
    "Men",
    "Women",
    "Children (18-)",
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // get coords first (returns Promise)
      const getCoords = () =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );

      const coords = await getCoords();
      const lat = coords.coords.latitude;
      const lng = coords.coords.longitude;

      const body = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          if (key === "services") {
            body.append(key, JSON.stringify(formData[key]));
          } else {
            body.append(key, formData[key]);
          }
        }
      });

      // no text location field – we rely solely on lat/lng

      body.append("lat", lat);
      body.append("lng", lng);

      const res = await fetch("/api/barbershop", {
        method: "POST",
        body,
      });

      if (res.ok) {
        // const data = await res.json();
        // alert("Barber shop registered successfully!");
        // // Extract username from email and redirect to dashboard
        // const username = formData.email.split("@")[0];
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

  // location autocomplete removed – no longer collecting city names

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-500 shadow-xl rounded-2xl p-8 w-[600px] relative mt-3"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-500">
          Barber Shop Registration
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="E-Mail"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        {/* Shop Info */}
        <input
          type="text"
          name="shopName"
          placeholder="Shop Name"
          value={formData.shopName}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        {/* Services */}
        <label className="block mb-2 font-medium">Services Offered</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {servicesList.map((service) => (
            <label key={service} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={service}
                checked={formData.services.includes(service)}
                onChange={handleCheckboxChange}
                className="h-4 w-4"
              />
              {service}
            </label>
          ))}
        </div>

        {/* File Upload */}
        <label className="block mb-1 font-medium">Shop Image (Optional)</label>
        <input
          type="file"
          name="shopImage"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block mb-1 font-medium">Barber Image (Optional)</label>
        <input
          type="file"
          name="barberImage"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4 p-2 border rounded"
        />

        
         {/* ✅ KYC Section */}
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          KYC Verification (Mandatory)
        </h3>

        <input
          type="text"
          name="aadharNumber"
          placeholder="Aadhar Number (12 digits)"
          value={formData.aadharNumber}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label className="block mb-1 font-medium">Aadhar Front (Required)</label>
        <input
          type="file"
          name="aadharFront"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <label className="block mb-1 font-medium">Aadhar Back (Required)</label>
        <input
          type="file"
          name="aadharBack"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <label className="block mb-1 font-medium">Selfie with Aadhar (Optional)</label>
        <input
          type="file"
          name="selfieWithAadhar"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-6 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className=" bg-blue-400 p-6 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {loading ? "Registering..." : "Register Shop"}
        </button>
      </form>
    </div>
  );
}
