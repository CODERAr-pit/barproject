"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberEditPage() {
  const router = useRouter();
  const [barber, setBarber] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Local state for the inputs
  const [isAvailable, setIsAvailable] = useState(true);
  const [nextAvailableAt, setNextAvailableAt] = useState("");

  // ✅ HELPER: Convert DB Date (UTC) to Input Format (Local Time)
  // Input type="datetime-local" needs "YYYY-MM-DDTHH:mm"
  const toLocalISOString = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Create a local date string manually to avoid UTC conversion
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const stored = localStorage.getItem("barber");
    
    // 1. FIX: Remove (barber) from the URL path
    if (!stored) return router.push("/login"); 
    
    const parsed = JSON.parse(stored);
    setBarber(parsed);
    setIsAvailable(parsed.isAvailable ?? true);
    
    // 2. FIX: Use the helper to show correct Local Time
    setNextAvailableAt(toLocalISOString(parsed.nextAvailableAt));
  }, [router]);

  const updateField = (k, v) => setBarber((b) => ({ ...b, [k]: v }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      
      const res = await fetch(`/api/barber/${barber._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: barber.firstName,
          lastName: barber.lastName,
          phone: barber.phone,
          shopName: barber.shopName,
          location: barber.location,
          // Handle services array cleaning
          services: Array.isArray(barber.services) ? barber.services : [], 
          shopImage: barber.shopImage,
          barberImage: barber.barberImage,
          isAvailable,
          // Save as standard Date object (DB will handle UTC conversion)
          nextAvailableAt: nextAvailableAt ? new Date(nextAvailableAt) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      // Update LocalStorage so the Dashboard reflects changes immediately
      localStorage.setItem("barber", JSON.stringify(data.data));
      
      alert("Profile updated successfully!");
      router.push("/dashboard"); // Or wherever your dashboard lives
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!barber) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl my-10 border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Edit Profile</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <label className="block">
            <span className="text-sm font-medium text-gray-700">First Name</span>
            <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
                value={barber.firstName || ""} onChange={(e) => updateField("firstName", e.target.value)} />
            </label>
            <label className="block">
            <span className="text-sm font-medium text-gray-700">Last Name</span>
            <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
                value={barber.lastName || ""} onChange={(e) => updateField("lastName", e.target.value)} />
            </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Phone</span>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
            value={barber.phone || ""} onChange={(e) => updateField("phone", e.target.value)} />
        </label>
        
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Shop Name</span>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
            value={barber.shopName || ""} onChange={(e) => updateField("shopName", e.target.value)} />
        </label>
        
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Location</span>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
            value={barber.location || ""} onChange={(e) => updateField("location", e.target.value)} />
        </label>
        
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Services (comma separated)</span>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" 
            value={(barber.services || []).join(", ")} 
            // Logic to keep array structure while editing
            onChange={(e) => updateField("services", e.target.value.split(",").map(s=>s.trim()))} 
          />
          <p className="text-xs text-gray-500 mt-1">Example: Haircut, Shave, Massage</p>
        </label>
        
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Shop Image URL</span>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
            value={barber.shopImage || ""} onChange={(e) => updateField("shopImage", e.target.value)} />
        </label>
      </div>

      {/* Availability Section */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Availability Settings</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-700">Currently Available</span>
          <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={isAvailable} onChange={(e)=>setIsAvailable(e.target.checked)} />
        </div>
        <label className="block">
          <span className="text-sm text-gray-600">Next Available Time</span>
          <input type="datetime-local" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" 
            value={nextAvailableAt} onChange={(e)=>setNextAvailableAt(e.target.value)} />
        </label>
      </div>

      <div className="mt-8 flex gap-3 justify-end">
        <button onClick={() => router.back()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
            {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}