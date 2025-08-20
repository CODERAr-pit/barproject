"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberSignup() {
  const [formData, setFormData] = useState({
    shopName: "",
    location: "",
    services: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/barbershop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          services: formData.services.split(",").map((s) => s.trim()), // convert string → array
        }),
      });

      if (res.ok) {
        alert("Barber shop registered successfully!");
        router.push("/(barber)/dashboard"); // redirect to dashboard
      } else {
        const error = await res.json();
        alert(error.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Barber Shop Signup</h2>

        <input
          type="text"
          name="shopName"
          placeholder="Shop Name"
          value={formData.shopName}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="passWord"
          placeholder="Password"
          value={formData.passWord}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="text"
          name="services"
          placeholder="Services (comma separated)"
          value={formData.services}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          {loading ? "Registering..." : "Register Shop"}
        </button>
      </form>
    </div>
  );
}
