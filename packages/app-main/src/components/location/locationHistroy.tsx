import { MapPin } from "lucide-react";

// Location History Graph component
function LocationHistoryGraph({ history }: { history?: { latitude: number; longitude: number; timestamp: number }[] }) {
  if (!history || history.length < 2) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-charcoalLight bg-taupeGrayFaint/50">
        <div className="flex flex-col items-center gap-2 text-charcoalBlueLight">
          <MapPin className="h-8 w-8 opacity-20" />
          <p className="text-sm">Insufficient location history to generate graph</p>
        </div>
      </div>
    );
  }

  // Sort by timestamp
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);

  const startTime = sortedHistory[0].timestamp;
  const endTime = sortedHistory[sortedHistory.length - 1].timestamp;
  const timeRange = endTime - startTime || 1;

  // Haversine distance helper
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let cumulativeDistance = 0;
  const points = sortedHistory.map((p, i) => {
    if (i > 0) {
      cumulativeDistance += getDistance(sortedHistory[i - 1].latitude, sortedHistory[i - 1].longitude, p.latitude, p.longitude);
    }
    return {
      x: ((p.timestamp - startTime) / timeRange) * 100,
      y: cumulativeDistance,
      timestamp: p.timestamp,
    };
  });

  const maxDistance = cumulativeDistance || 1;
  // Create a path that goes from the bottom left, through the points, to the bottom right for the fill
  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${100 - (p.y / maxDistance) * 70 - 15}`).join(" ");
  const areaPathData = `${pathData} L 100 100 L 0 100 Z`;

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-charcoalLight bg-white shadow-sm">
      <div className="absolute inset-0 opacity-[0.08] bg-linear-to-r from-blue-600 via-purple-600 to-red-600" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area Fill */}
        <path d={areaPathData} fill="url(#areaGradient)" className="text-blue-500/20" />

        {/* Grid Lines */}
        <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="0.1" className="text-charcoalLight/20" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" className="text-charcoalLight/20" />
        <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" strokeWidth="0.1" className="text-charcoalLight/20" />

        {/* The Graph Line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={100 - (p.y / maxDistance) * 70 - 15}
            r="1.5"
            fill="white"
            stroke={i === 0 ? "#3b82f6" : i === points.length - 1 ? "#ef4444" : "#a855f7"}
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Overlays */}
      <div className="absolute top-3 left-4 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoalBlue opacity-60">Location Activity</span>
        <span className="text-lg font-bold text-charcoalBlue">
          {Math.round(cumulativeDistance)}m <span className="text-sm font-normal text-charcoalBlueLight">traveled</span>
        </span>
      </div>

      <div className="absolute bottom-3 left-4 text-[10px] font-medium text-charcoalBlueLight">
        {new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] font-medium text-charcoalBlueLight">
        {new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}
