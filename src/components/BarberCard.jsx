export default function BarberCard({ data }) {
  if (!data || data.length === 0) {
    return <p>No barbers found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, idx) => (
        <div
          key={idx}
          className="p-4 border rounded-xl shadow-md hover:shadow-lg bg-white"
        >
          <div className="font-extrabold text-lg">{item.shopName}</div>
          <div className="text-gray-600">{item.location}</div>
          <div className="mt-2">
            <p className="font-medium">Services:</p>
            {item.service.map((subitem, i) => (
              <div key={i} className="text-sm">• {subitem}</div>
            ))}
          </div>
          <div className="mt-2 text-yellow-500 font-semibold">
            ⭐ {item.rating}
          </div>
        </div>
      ))}
    </div>
  );
}
