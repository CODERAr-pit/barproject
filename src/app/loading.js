// src/app/loading.js
export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl mt-12 grid grid-cols-1 md:grid-rows-3 gap-6">
        {/* Render 3 fake "skeleton" cards while waiting for the DB */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-pulse">
            <div className="flex gap-6">
              {/* Fake Image */}
              <div className="w-28 h-28 bg-slate-800 rounded-xl shrink-0"></div>
              
              {/* Fake Details */}
              <div className="flex-1 space-y-4 py-1">
                <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2 mt-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}