// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Mail, Phone, Scissors, Calendar, User, 
//   LogOut, Store, Image as ImageIcon,
//   Loader2, Clock, CalendarOff
// } from "lucide-react";
// import Hashids from 'hashids';

// const hashids = new Hashids("your_secret_salt", 8);
// // --- Loading Spinner ---
// const LoadingSpinner = () => (
//   <div className="flex justify-center items-center min-h-screen bg-slate-950">
//     <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
//   </div>
// );

// // --- Helper: Fix Timezone Issue ---
// const toLocalISOString = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   const offset = date.getTimezoneOffset() * 60000;
//   const localDate = new Date(date.getTime() - offset);
//   return localDate.toISOString().slice(0, 16);
// };

// export default function BarberDashboard() {
//   const router = useRouter();
//   const [barber, setBarber] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [savingAvail, setSavingAvail] = useState(false);

//   // Bookings State
//   const [bookings, setBookings] = useState([]);
//   const [loadingBookings, setLoadingBookings] = useState(false);
  
//   // NEW: State for filtering bookings by date (defaults to today)
//   const [bookingFilterDate, setBookingFilterDate] = useState(new Date().toISOString().split("T")[0]);

//   // Global Availability State
//   const [isAvailable, setIsAvailable] = useState(true);
//   const [nextAvailableAt, setNextAvailableAt] = useState("");

//   // Specific Slot Blocking State
//   const [blockDate, setBlockDate] = useState(new Date().toISOString().split("T")[0]);
//   const [blockedTimeSlots, setBlockedTimeSlots] = useState([]);
//   const [savingBlocked, setSavingBlocked] = useState(false);

//   // Standard Barber Working Hours
//   const allTimeSlots = [
//     "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
//     "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
//     "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
//     "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"
//   ];

//   // Fetch Bookings
//   const fetchBookings = async (barberId) => {
//     if (!barberId) return;
//     setLoadingBookings(true);
//     try {
//       const res = await fetch(`/api/bookings?barberId=${barberId}&scope=upcoming`);
//       const data = await res.json();
//       if (res.ok && data.data) {
//         setBookings(Array.isArray(data.data) ? data.data : []);
//       }
//     } catch (error) {
//       console.error("Failed to load bookings:", error);
//     } finally {
//       setLoadingBookings(false);
//     }
//   };

//   // Init
//  // Init & Sync
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedBarber = localStorage.getItem("barber");
      
//       if (storedBarber) {
//         const parsedBarber = JSON.parse(storedBarber);
        
//         // 1. Set initial state immediately so the screen doesn't stay blank
//         setBarber(parsedBarber);
//         setIsAvailable(parsedBarber.isAvailable ?? true);
//         setNextAvailableAt(toLocalISOString(parsedBarber.nextAvailableAt));
        
//         // 2. Fetch bookings
//         fetchBookings(parsedBarber._id);

//         // 3. ✨ THE FIX: Fetch the fresh profile directly from the Database ✨
//         const syncFreshBarberData = async () => {
//           try {
//             // Note: Adjust this URL if your specific barber fetch route is different
//             const res = await fetch(`/api/barber/${parsedBarber.id}`);
//             const data = await res.json();
            
//             if (res.ok && data.data) {
//               const freshBarber = data.data;
//               setBarber(freshBarber); // Updates state with the real database blockedSlots!
              
//               // Keep localStorage updated with the fresh database info
//               localStorage.setItem("barber", JSON.stringify(freshBarber)); 
//             }
//           } catch (err) {
//             console.error("Failed to sync fresh barber data:", err);
//           }
//         };

//         syncFreshBarberData();

//       } else {
//         router.push("/login");
//       }
//       setLoading(false);
//     }
//   }, [router]);

//   // NEW: Watch for blockDate changes and update red slots from the database
//   useEffect(() => {
//     if (barber && barber.blockedSlots) {
//       const existingBlock = barber.blockedSlots.find(bs => bs.date === blockDate);
//       if (existingBlock) {
//         setBlockedTimeSlots(existingBlock.slots || []);
//       } else {
//         setBlockedTimeSlots([]); // clear if no slots are blocked on this new date
//       }
//     } else {
//       setBlockedTimeSlots([]);
//     }
//   }, [blockDate, barber]);

//   const handleLogout = () => {
//     localStorage.removeItem("barber");
//     router.push("/login");
//   };

//   // Save Global Availability
//   const saveAvailability = async () => {
//     if (!barber?._id) return;
//     try {
//       setSavingAvail(true);
//       const res = await fetch(`/api/barber/${barber.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           isAvailable,
//           nextAvailableAt: !isAvailable && nextAvailableAt ? new Date(nextAvailableAt) : null,
//         }),
//       });
      
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed");

//       const updatedBarber = data.data;
//       localStorage.setItem("barber", JSON.stringify(updatedBarber));
      
//       setBarber(updatedBarber);
//       setIsAvailable(updatedBarber.isAvailable ?? true);
//       setNextAvailableAt(toLocalISOString(updatedBarber.nextAvailableAt));
      
//       alert("Shop status updated!");
//     } catch (e) {
//       alert(e.message);
//     } finally {
//       setSavingAvail(false);
//     }
//   };

//   // Toggle Specific Slot Checkbox Logic
//   const handleSlotToggle = (slot) => {
//     if (blockedTimeSlots.includes(slot)) {
//       setBlockedTimeSlots(prev => prev.filter(s => s !== slot));
//     } else {
//       setBlockedTimeSlots(prev => [...prev, slot]);
//     }
//   };

//   // Save Blocked Slots to Backend
//   const saveBlockedSlots = async () => {
//     if (!barber?._id) return;
    
//     try {
//       setSavingBlocked(true);
      
//       const res = await fetch(`/api/blockslots/${barber.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           date: blockDate, 
//           slots: blockedTimeSlots
//         }),
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data.error || "Failed to save blocked slots.");
//       }
      
//       alert(`Success: Slots updated for ${blockDate}`);
      
//       // Update local barber state so it remembers without reloading!
//       const updatedBarber = { ...barber };
//       if (!updatedBarber.blockedSlots) updatedBarber.blockedSlots = [];
      
//       const dateIndex = updatedBarber.blockedSlots.findIndex(bs => bs.date === blockDate);
//       if (dateIndex > -1) {
//         updatedBarber.blockedSlots[dateIndex].slots = blockedTimeSlots;
//       } else {
//         updatedBarber.blockedSlots.push({ date: blockDate, slots: blockedTimeSlots });
//       }
      
//       setBarber(updatedBarber);
//       localStorage.setItem("barber", JSON.stringify(updatedBarber));
      
//       // Notice we DO NOT clear setBlockedTimeSlots([]) anymore so they stay red!
      
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     } finally {
//       setSavingBlocked(false);
//     }
//   };

//   if (loading) return <LoadingSpinner />;
//   if (!barber) return null;

//   // Filter bookings to only show the selected date
//   const filteredBookings = bookings.filter((booking) => {
//     const bookingDateStr = new Date(booking.startTime).toISOString().split("T")[0];
//     return bookingDateStr === bookingFilterDate;
//   });

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200">
      
//       {/* Top Header */}
//       <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="bg-red-600 p-3 rounded-xl shadow-sm shadow-red-500/20">
//               <Scissors className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-white">{barber.shopName || "My Shop"}</h1>
//               <p className="text-sm text-slate-400">Welcome back, {barber.firstName}</p>
//             </div>
//           </div>
//           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
//             <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
//           </button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-8">
            
//             {/* Bookings Section */}
//             <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 sm:p-8">
//                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
//                     <h3 className="text-2xl font-bold text-white">Appointments</h3>
                    
//                     {/* NEW: Datewise filter controls */}
//                     <div className="flex items-center gap-3">
//                       <input 
//                         type="date" 
//                         value={bookingFilterDate}
//                         onChange={(e) => setBookingFilterDate(e.target.value)}
//                         className="bg-slate-800 border-slate-700 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 p-2 text-sm"
//                       />
//                       <button onClick={() => fetchBookings(barber.id)} className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors border border-red-500/30 px-3 py-2 rounded-lg bg-red-500/10">
//                         Refresh
//                       </button>
//                     </div>
//                 </div>
                
//                 {loadingBookings ? (
//                     <div className="flex justify-center py-8"><Loader2 className="animate-spin text-red-500"/></div>
//                 ) : filteredBookings.length > 0 ? (
//                     <div className="space-y-3">
//                         {filteredBookings.map((booking, index) => (
//                             <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors gap-4">
//                                 <div className="flex items-start sm:items-center gap-4">
//                                     <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-slate-400 shrink-0">
//                                         <Clock className="w-6 h-6 text-red-500" />
//                                     </div>
//                                     <div>
//                                         <p className="font-bold text-white text-lg">
//                                             {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                         </p>
//                                         <p className="text-md font-semibold text-slate-200 mt-1">
//                                             {booking.user?.firstName 
//                                                 ? `${booking.user.firstName} ${booking.user.lastName || ''}` 
//                                                 : "Walk-in / Unknown"}
//                                         </p>
//                                         <p className="text-sm text-slate-400 mt-0.5">
//                                             {Array.isArray(booking.serviceType) ? booking.serviceType.join(", ") : (booking.serviceType || booking.service || "Standard Cut")}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
//                                      <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs rounded-full font-bold uppercase tracking-wider">
//                                        Confirmed
//                                      </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-12 bg-slate-800/20 rounded-xl border border-slate-800 text-slate-500">
//                         <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
//                         <p>Your chair is empty.</p>
//                         <p className="text-sm mt-1">No bookings scheduled for this date.</p>
//                     </div>
//                 )}
//             </div>

//             {/* Shop & Personal Info */}
//             <InfoCard title="Profile & Shop Details">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <InfoItem icon={User} label="Owner" value={`${barber.firstName} ${barber.lastName}`} />
//                   <InfoItem icon={Mail} label="Email" value={barber.email} />
//                   <InfoItem icon={Phone} label="Phone" value={barber.phone} />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-slate-400 mb-3">Services Offered</p>
//                   <div className="flex flex-wrap gap-2">
//                     {barber.services?.length > 0 ? (
//                         barber.services.map((service) => (
//                         <span key={service} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full text-xs font-medium">
//                             {service}
//                         </span>
//                         ))
//                     ) : (
//                         <p className="text-slate-500 text-sm italic">No services listed yet.</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </InfoCard>
//           </div>

//           {/* Right Column (Controls & Images) */}
//           <div className="space-y-8">
            
//             {/* Global Availability Control */}
//             <AvailabilityCard
//               isAvailable={isAvailable}
//               onToggle={setIsAvailable}
//               nextAvailableAt={nextAvailableAt}
//               onDateChange={(e) => setNextAvailableAt(e.target.value)}
//               onSave={saveAvailability}
//               savingAvail={savingAvail}
//             />

//             {/* Block Specific Slots Control */}
//             <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <CalendarOff className="w-5 h-5 text-red-500" />
//                 <h3 className="text-lg font-bold text-white">Block Specific Times</h3>
//               </div>
//               <p className="text-xs text-slate-400 mb-4">
//                 Select a date to view or modify your blocked lunch breaks and errands.
//               </p>

//               {/* Date Selector */}
//               <div className="mb-4">
//                 <input 
//                   type="date" 
//                   value={blockDate}
//                   onChange={(e) => setBlockDate(e.target.value)}
//                   className="w-full bg-slate-800 border-slate-700 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 p-2 text-sm"
//                 />
//               </div>

//               {/* Time Slots Grid */}
//               <div className="h-48 overflow-y-auto pr-2 mb-4 space-y-2 custom-scrollbar">
//                 <div className="grid grid-cols-3 gap-2">
//                   {allTimeSlots.map((slot) => {
//                     const isBlocked = blockedTimeSlots.includes(slot);
//                     return (
//                       <button
//                         key={slot}
//                         onClick={() => handleSlotToggle(slot)}
//                         className={`py-2 text-xs font-medium rounded-lg border transition-all ${
//                           isBlocked 
//                             ? "bg-red-500/10 text-red-400 border-red-500/50 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]" 
//                             : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300"
//                         }`}
//                       >
//                         {slot}
//                       </button>
//                     )
//                   })}
//                 </div>
//               </div>

//               <button 
//                 onClick={saveBlockedSlots} 
//                 disabled={savingBlocked} 
//                 className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {savingBlocked ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Blocked Slots"}
//               </button>
//             </div>
            
//             {/* Quick Actions */}
//             <ActionsCard />

//             {/* Images */}
//             <ImageCard title="Shop Front" icon={Store} src={barber.shopImage} />
//           </div>
//         </div>
//       </main>

//       <style dangerouslySetInnerHTML={{__html: `
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
//       `}} />
//     </div>
//   );
// }

// // --- Reusable Components ---

// const InfoCard = ({ title, children }) => (
//   <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 sm:p-8">
//     <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-slate-800">{title}</h3>
//     <div>{children}</div>
//   </div>
// );

// const InfoItem = ({ icon: Icon, label, value }) => (
//   <div className="flex items-center gap-3 mb-4">
//     <div className="flex-shrink-0 bg-slate-800 p-2 rounded-lg border border-slate-700">
//       {Icon && <Icon className="w-4 h-4 text-red-500" />}
//     </div>
//     <div>
//       <p className="text-xs font-medium text-slate-500">{label}</p>
//       <p className="text-sm text-white font-medium">{value || "—"}</p>
//     </div>
//   </div>
// );

// const ImageCard = ({ title, icon: Icon, src }) => (
//   <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-5">
//     <div className="flex items-center gap-2 mb-3">
//       <Icon className="w-4 h-4 text-slate-400" />
//       <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{title}</h3>
//     </div>
//     {src ? (
//       <img src={src} alt={title} className="w-full h-48 object-cover rounded-xl border border-slate-700" />
//     ) : (
//       <div className="w-full h-48 bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-700">
//         <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
//         <span className="text-slate-500 text-xs">No image</span>
//       </div>
//     )}
//   </div>
// );

// const AvailabilityCard = ({ isAvailable, onToggle, nextAvailableAt, onDateChange, onSave, savingAvail }) => (
//   <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 space-y-5">
//     <h3 className="text-lg font-bold text-white flex items-center gap-2">
//       <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
//       Status & Availability
//     </h3>
//     <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
//       <div>
//         <span className="block font-semibold text-slate-200">Accepting Bookings</span>
//         <span className="text-xs text-slate-500">Toggle if you are closing the shop</span>
//       </div>
//       <ToggleSwitch checked={isAvailable} onChange={onToggle} />
//     </div>
//     <div className={`space-y-2 transition-all duration-300 ${isAvailable ? 'opacity-50 pointer-events-none hidden' : 'opacity-100 block'}`}>
//       <label htmlFor="nextAvailableAt" className="block text-xs font-medium text-slate-400">Shop Opening At (Optional)</label>
//       <input 
//         id="nextAvailableAt" 
//         type="datetime-local" 
//         value={nextAvailableAt} 
//         onChange={onDateChange} 
//         disabled={isAvailable} 
//         className="w-full bg-slate-800 border-slate-700 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-slate-900 disabled:text-slate-600 p-2.5 border text-sm" 
//       />
//     </div>
//     <button 
//       onClick={onSave} 
//       disabled={savingAvail} 
//       className="mt-2 w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//     >
//       {savingAvail ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Status"}
//     </button>
//   </div>
// );

// const ActionsCard = () => (
//   <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-5 flex gap-3">
//     <a href="/edit" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all">
//       Edit Profile
//     </a>
//   </div>
// );

// const ToggleSwitch = ({ checked, onChange }) => (
//   <button 
//     type="button" 
//     className={`${checked ? "bg-green-500" : "bg-slate-700"} relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900`} 
//     role="switch" 
//     aria-checked={checked} 
//     onClick={() => onChange(!checked)}
//   >
//     <span 
//       aria-hidden="true" 
//       className={`${checked ? "translate-x-5" : "translate-x-0"} inline-block h-5 w-5 transform bg-white rounded-full shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5`} 
//     />
//   </button>
// );