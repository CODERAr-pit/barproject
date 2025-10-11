"use client";

export default function BarberCard({ data }) {
  // If data is not provided or empty, show message
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-lg">
          No barbers found in this area
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Try searching in a different city
        </p>
      </div>
    );
  }
const handleAppointment=()=>{
    
}
  return (
    <div onClick={handleAppointment} className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data.map((barber) => (
        <div
          key={barber._id}
          className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {/* Barber Image */}
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            {barber.barberImage ? (
              <img 
                src={barber.barberImage} 
                alt={barber.shopName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-gray-400 text-4xl">💇‍♂️</div>
            )}
          </div>

          {/* Barber Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {barber.shopName}
            </h2>
            
            <div className="flex items-center text-gray-600 mb-2">
              <span className="text-sm">📍</span>
              <span className="ml-1 text-sm">{barber.location}</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <span className="text-sm">📞</span>
              <span className="ml-1 text-sm">{barber.phone}</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <span className="text-sm">👤</span>
              <span className="ml-1 text-sm">{barber.firstName} {barber.lastName}</span>
            </div>

            {/* Services */}
            {barber.services && barber.services.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {barber.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {barber.services.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{barber.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button onClick={handleAppointment} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Book Appointment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
