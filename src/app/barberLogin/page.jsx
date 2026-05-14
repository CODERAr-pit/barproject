"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react"; // 👈 1. Import NextAuth

export default function BarberLogin() { // Renamed from BarberSignup since it's a login form!
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 👈 Added for better UI error handling
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any old errors

    try {
      // 2. Call NextAuth directly! No custom API route needed.
      const res = await signIn("credentials", {
        redirect: false, // We handle the redirect manually below
        email: formData.email,
        password: formData.password,
        role: "barber", // 👈 3. The Traffic Director! Tells NextAuth to check the Barber DB
      });

      if (res?.error) {
        // If the password was wrong, or Zod failed, NextAuth sends the error string here
        setError(res.error);
      } else if (res?.ok) {
        router.push("/dashboard"); 
        router.refresh(); // Forces Next.js to update the session state globally
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 shadow-lg rounded-2xl p-6 w-96 text-white"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Barber Shop Login</h2>

        {/* Display NextAuth errors nicely */}
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-Mail"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded text-white"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border border-slate-600 bg-slate-700 rounded text-white"
          required
        />
        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-32 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Submit"}
          </button>

          <div>
            <Link 
              href="/barberSignUp" 
              className="text-slate-300 hover:text-blue-400 transition-colors text-sm" 
            >
              Sign-Up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}