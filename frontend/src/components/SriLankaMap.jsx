import React, { useState } from 'react';

// Approximate district positions on Sri Lanka map (x%, y% within viewBox)
const DISTRICT_POSITIONS = {
  'Jaffna':        { x: 34, y: 4  },
  'Kilinochchi':   { x: 37, y: 17 },
  'Mannar':        { x: 16, y: 20 },
  'Vavuniya':      { x: 40, y: 27 },
  'Trincomalee':   { x: 65, y: 31 },
  'Batticaloa':    { x: 72, y: 48 },
  'Ampara':        { x: 68, y: 59 },
  'Puttalam':      { x: 17, y: 41 },
  'Kurunegala':    { x: 31, y: 46 },
  'Anuradhapura':  { x: 40, y: 37 },
  'Polonnaruwa':   { x: 54, y: 44 },
  'Matale':        { x: 43, y: 53 },
  'Kandy':         { x: 38, y: 61 },
  'Nuwara Eliya':  { x: 44, y: 68 },
  'Kegalle':       { x: 29, y: 64 },
  'Ratnapura':     { x: 30, y: 74 },
  'Colombo':       { x: 18, y: 70 },
  'Gampaha':       { x: 21, y: 61 },
  'Kalutara':      { x: 20, y: 78 },
  'Galle':         { x: 22, y: 87 },
  'Matara':        { x: 32, y: 92 },
  'Hambantota':    { x: 50, y: 93 },
  'Badulla':       { x: 52, y: 70 },
  'Monaragala':    { x: 59, y: 79 },
  'Mullaitivu':    { x: 54, y: 14 },
};

const COLORS_SCALE = [
  '#1e3a5f','#1a4a7a','#1d5c9e','#2f74c0','#4890d8',
  '#60a8e8','#7ab8f0','#a0ccf8','#c4dffb','#e8f4ff'
].reverse(); // darkest = highest

function getColor(value, max) {
  if (!max || !value) return '#1e293b';
  const idx = Math.min(Math.floor((value / max) * (COLORS_SCALE.length - 1)), COLORS_SCALE.length - 1);
  return COLORS_SCALE[idx];
}

function getBubbleR(value, max) {
  if (!max || !value) return 4;
  return 4 + (value / max) * 18;
}

export default function SriLankaMap({ heatmapData = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const dataMap = {};
  heatmapData.forEach(d => { dataMap[d._id] = d; });
  const maxQty = Math.max(...heatmapData.map(d => d.totalQty), 1);

  return (
    <div className="relative w-full" style={{ maxWidth: 380, margin: '0 auto' }}>
      {/* Sri Lanka SVG outline */}
      <svg viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-xl">
        {/* Simplified Sri Lanka outline path */}
        <defs>
          <radialGradient id="oceanBg" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#0f1f35" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>
        </defs>
        <rect width="100" height="105" fill="url(#oceanBg)" rx="4" />

        {/* Sri Lanka approximate outline */}
        <path
          d="M32,2 L36,2 L40,4 L44,3 L50,5 L55,4 L60,7 L64,12 L68,17 L72,22 L74,28 L76,34 L77,40 L76,46 L75,52 L74,58 L72,64 L68,70 L63,76 L58,82 L53,87 L48,92 L42,96 L36,98 L30,96 L24,92 L19,86 L15,80 L12,73 L11,67 L12,61 L13,55 L14,49 L15,43 L17,37 L18,31 L19,25 L20,19 L22,13 L25,8 L28,4 Z"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="0.5"
        />

        {/* Province guide lines (subtle) */}
        <line x1="15" y1="50" x2="77" y2="50" stroke="#334155" strokeWidth="0.15" strokeDasharray="1,2" opacity="0.4" />
        <line x1="44" y1="3" x2="44" y2="98" stroke="#334155" strokeWidth="0.15" strokeDasharray="1,2" opacity="0.4" />

        {/* District bubbles */}
        {Object.entries(DISTRICT_POSITIONS).map(([district, pos]) => {
          const d = dataMap[district];
          const qty = d?.totalQty || 0;
          const r = getBubbleR(qty, maxQty);
          const fill = getColor(qty, maxQty);
          const isHovered = tooltip?.district === district;

          return (
            <g key={district}
              onMouseEnter={(e) => setTooltip({ district, ...pos, data: d })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? r + 2 : r}
                fill={fill}
                stroke={isHovered ? '#6366f1' : qty > 0 ? '#60a8e8' : '#334155'}
                strokeWidth={isHovered ? 0.8 : 0.3}
                opacity={qty > 0 ? 0.9 : 0.4}
                style={{ transition: 'all 0.15s' }}
              />
              {/* Label for districts with notable data */}
              {qty > 0 && r > 8 && (
                <text x={pos.x} y={pos.y + 0.4} textAnchor="middle" dominantBaseline="middle"
                  fontSize="2.2" fill="white" fontWeight="600" opacity="0.9"
                  style={{ pointerEvents: 'none' }}>
                  {district.length > 7 ? district.substring(0, 6) + '…' : district}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-2 right-2 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-xl text-xs min-w-[160px] pointer-events-none z-10">
          <p className="font-bold text-white text-sm mb-1">{tooltip.district}</p>
          {tooltip.data ? (
            <>
              <p className="text-slate-400">Units Sold: <span className="text-cyan-400 font-semibold">{tooltip.data.totalQty?.toLocaleString()}</span></p>
              <p className="text-slate-400">Sales: <span className="text-indigo-400 font-semibold">{tooltip.data.saleCount?.toLocaleString()}</span></p>
              <p className="text-slate-400">Revenue: <span className="text-emerald-400 font-semibold">LKR {tooltip.data.totalRevenue?.toLocaleString()}</span></p>
            </>
          ) : (
            <p className="text-slate-500">No data for this period</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-xs text-slate-500">Low</span>
        <div className="flex gap-0.5">
          {COLORS_SCALE.slice().reverse().map((c, i) => (
            <div key={i} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: c }}></div>
          ))}
        </div>
        <span className="text-xs text-slate-500">High</span>
      </div>
      <p className="text-center text-xs text-slate-600 mt-1">Bubble size = units sold per district</p>
    </div>
  );
}
