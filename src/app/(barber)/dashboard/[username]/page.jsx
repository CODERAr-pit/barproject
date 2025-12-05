"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Phone, MapPin, Scissors, ThumbsUp, ThumbsDown,
  Calendar, User, LogOut, Store, Image as ImageIcon,
  Loader2, Star, Clock 
} from "lucide-react";

// --- Loading Spinner ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-slate-100">
    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
  </div>
);

// --- Helper: Fix Timezone Issue ---
const toLocalISOString = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

export default function BarberDashboard() {
  const router = useRouter();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAvail, setSavingAvail] = useState(false);

  // New State for Bookings
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Availability State
  const [isAvailable, setIsAvailable] = useState(true);
  const [nextAvailableAt, setNextAvailableAt] = useState("");

  // ✅ 1. Fetch Bookings Function
  const fetchBookings = async (barberId) => {
    if (!barberId) return;
    setLoadingBookings(true);
    try {
      // Fetch upcoming bookings (Next 7 days)
      const res = await fetch(`/api/bookings?barberId=${barberId}&scope=upcoming`);
      const data = await res.json();

      if (res.ok && data.data) {
        setBookings(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ✅ 2. Load Barber & Init
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedBarber = localStorage.getItem("barber");
      
      if (storedBarber) {
        const parsedBarber = JSON.parse(storedBarber);
        setBarber(parsedBarber);
        
        setIsAvailable(parsedBarber.isAvailable ?? true);
        setNextAvailableAt(toLocalISOString(parsedBarber.nextAvailableAt));

        // FETCH BOOKINGS NOW
        fetchBookings(parsedBarber._id);

      } else {
        router.push("/login");
      }
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("barber");
    router.push("/login");
  };

  const saveAvailability = async () => {
    if (!barber?._id) return;
    try {
      setSavingAvail(true);
      const res = await fetch(`/api/barber/${barber._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable,
          nextAvailableAt: !isAvailable && nextAvailableAt ? new Date(nextAvailableAt) : null,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const updatedBarber = data.data;
      localStorage.setItem("barber", JSON.stringify(updatedBarber));
      
      setBarber(updatedBarber);
      setIsAvailable(updatedBarber.isAvailable ?? true);
      setNextAvailableAt(toLocalISOString(updatedBarber.nextAvailableAt));
      
      alert("Availability updated!");
      
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingAvail(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (loading) return <LoadingSpinner />;
  if (!barber) return null;

  const rating = barber.upvote + barber.downvote > 0
      ? ((barber.upvote / (barber.upvote + barber.downvote)) * 100).toFixed(0)
      : "0";

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-sm">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {barber.firstName}!</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={ThumbsUp} title="Total Upvotes" value={barber.upvote || 0} color="green" />
          <StatCard icon={ThumbsDown} title="Total Downvotes" value={barber.downvote || 0} color="red" />
          <StatCard icon={Star} title="Approval Rating" value={`${rating}%`} color="indigo" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- NEW: BOOKINGS SECTION (FIXED) --- */}
            <div className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h3>
                    <button onClick={() => fetchBookings(barber._id)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Refresh</button>
                </div>
                
                {loadingBookings ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600"/></div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-3">
                        {bookings.map((booking, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        {/* ✅ FIX 1: Display Date & Time correctly from 'startTime' */}
                                        <p className="font-bold text-gray-900">
                                            {new Date(booking.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            {" at "}
                                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        
                                        {/* ✅ FIX 2: Display Customer Name (if populated) */}
                                        <p className="text-sm font-semibold text-gray-700">
                                            {booking.user?.firstName 
                                                ? `${booking.user.firstName} ${booking.user.lastName || ''}` 
                                                : "Unknown Customer"}
                                        </p>

                                        {/* ✅ FIX 3: Display Service Name */}
                                        <p className="text-xs text-gray-500">
                                            {booking.serviceType || booking.service || "Standard Service"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Confirmed</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        No bookings found for the next 7 days.
                    </div>
                )}
            </div>

            <InfoCard title="Personal Information">
              <InfoItem label="Full Name" value={`${barber.firstName} ${barber.lastName}`} />
              <InfoItem icon={Mail} label="Email" value={barber.email} />
              <InfoItem icon={Phone} label="Phone" value={barber.phone} />
            </InfoCard>

            <InfoCard title="Shop Information">
              <InfoItem label="Shop Name" value={barber.shopName} />
              <InfoItem icon={MapPin} label="Location" value={barber.location} />
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">Services Offered</p>
                  <div className="flex flex-wrap gap-2">
                    {barber.services?.length > 0 ? (
                        barber.services.map((service) => (
                        <span key={service} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                            {service}
                        </span>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No services listed yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ImageCard title="Profile Photo" icon={User} src={barber.barberImage} />
            <ImageCard title="Shop Photo" icon={Store} src={barber.shopImage} />
            <AvailabilityCard
              isAvailable={isAvailable}
              onToggle={setIsAvailable}
              nextAvailableAt={nextAvailableAt}
              onDateChange={(e) => setNextAvailableAt(e.target.value)}
              onSave={saveAvailability}
              savingAvail={savingAvail}
            />
            <ActionsCard />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Reusable Components ---
const StatCard = ({ icon: Icon, title, value, color }) => {
  const colors = { green: "text-green-600 bg-green-100", red: "text-red-600 bg-red-100", indigo: "text-indigo-600 bg-indigo-100" };
  return (
    <div className="bg-white rounded-2xl shadow-xl border p-6 transform hover:-translate-y-1 transition-transform duration-300">
      <div className={`p-3 rounded-lg inline-block mb-4 ${colors[color]}`}><Icon className="w-7 h-7" /></div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
};
const InfoCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-slate-200">{title}</h3>
    <div className="space-y-5">{children}</div>
  </div>
);
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-6 text-center pt-1">{Icon && <Icon className="w-5 h-5 text-indigo-600 inline-block" />}</div>
    <div className="flex-1"><p className="text-sm font-medium text-gray-500">{label}</p><p className="text-lg text-gray-900 font-semibold">{value || "—"}</p></div>
  </div>
);
const ImageCard = ({ title, icon: Icon, src }) => (
  <div className="bg-white rounded-2xl shadow-xl border p-6 transform hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center gap-3 mb-4"><Icon className="w-5 h-5 text-indigo-600" /><h3 className="text-lg font-bold text-gray-900">{title}</h3></div>
    {src ? <img src={src} alt={title} className="w-full h-64 object-cover rounded-lg shadow-md" /> : <div className="w-full h-64 bg-slate-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300"><ImageIcon className="w-12 h-12 text-gray-400 mb-2" /><span className="text-gray-400 text-sm">No image uploaded</span></div>}
  </div>
);
const AvailabilityCard = ({ isAvailable, onToggle, nextAvailableAt, onDateChange, onSave, savingAvail }) => (
  <div className="bg-white rounded-2xl shadow-xl border p-6 space-y-5 transform hover:-translate-y-1 transition-all duration-300">
    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600"/> Manage Availability</h3>
    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"><span className="font-medium text-gray-700">Currently Available</span><ToggleSwitch checked={isAvailable} onChange={onToggle} /></div>
    <div className={`space-y-2 transition-all duration-300 ${isAvailable ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <label htmlFor="nextAvailableAt" className="block text-sm font-medium text-gray-600">Next Available At</label>
      <input id="nextAvailableAt" type="datetime-local" value={nextAvailableAt} onChange={onDateChange} disabled={isAvailable} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 p-2 border" />
    </div>
    <button onClick={onSave} disabled={savingAvail} className="mt-2 w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">{savingAvail ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Availability"}</button>
  </div>
);
const ActionsCard = () => (
  <div className="bg-white rounded-2xl shadow-xl border p-6 space-y-4 transform hover:-translate-y-1 transition-all duration-300">
    <h3 className="text-xl font-bold text-gray-900">Manage Account</h3>
    <a href="/edit" className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg">Edit Profile</a>
    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-6 rounded-lg transition-all">Update Shop Details</button>
  </div>
);
const ToggleSwitch = ({ checked, onChange }) => (
  <button type="button" className={`${checked ? "bg-green-500" : "bg-gray-300"} relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
    <span aria-hidden="true" className={`${checked ? "translate-x-5" : "translate-x-0"} inline-block h-5 w-5 transform bg-white rounded-full shadow-lg transition duration-200 ease-in-out mt-0.5 ml-0.5`} />
  </button>
);