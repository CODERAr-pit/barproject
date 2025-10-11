"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function BarberDashboard() {
  const params = useParams();
  const username = params.username;
  const [barberData, setBarberData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch barber data from an API
    // For now, we'll just display the username
    setBarberData({
      username: username,
      shopName: "My Barber Shop",
      location: "Sample Location"
    });
    setLoading(false);
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {barberData?.username}!
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your barber shop and appointments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shop Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Shop Information
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Shop Name:</span> {barberData?.shopName}</p>
              <p><span className="font-medium">Location:</span> {barberData?.location}</p>
              <p><span className="font-medium">Email:</span> {username}@example.com</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Today's Appointments:</span> 5</p>
              <p><span className="font-medium">This Week:</span> 25</p>
              <p><span className="font-medium">This Month:</span> 100</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                View Appointments
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                Add New Service
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
                Manage Slots
              </button>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Appointments
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500">
              No appointments yet. Start by setting up your services and availability.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
