"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function BarberSignup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const res = await fetch("/api/barberlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData
        }),
      });

      const data = await res.json();

      if (data.success) {
      // ✅ Store barber details locally
      localStorage.setItem("barber", JSON.stringify(data.user));

      // ✅ Redirect to dashboard
      router.push(data.redirectUrl);
    } else {
        // Show error message
        alert(data.error || "Login failed");
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
        className="bg-slate-600 shadow-lg rounded-2xl p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Barber Shop Login</h2>

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
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <div className="flex justify-between p-3">
        <button
        type="submit"
        className="w-32 bg-blue-300 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
        onClick={handleSubmit}
>
  Submit
</button>

       <div>
       <Link href="/barberSignUp" className="hover:text-blue-400 hover:p-2.5 transition-colors " >
          Sign-Up</Link></div>
        </div>
        </form></div>
        
  )
}


