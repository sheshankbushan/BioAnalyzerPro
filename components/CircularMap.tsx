
import React from 'react';

interface Props {
  gcContent: number;
}

const CircularMap: React.FC<Props> = ({ gcContent }) => {
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const strokeWidth = 12;

  // Mock GC Skew logic for visual aesthetic
  const segments = 60;
  const points = Array.from({ length: segments }).map((_, i) => {
    const angle = (i / segments) * 2 * Math.PI;
    const offset = Math.sin(i * 0.4) * 8 + (Math.random() * 4);
    return {
      x: center + (radius + offset) * Math.cos(angle),
      y: center + (radius + offset) * Math.sin(angle),
      color: offset > 0 ? '#10b981' : '#f43f5e'
    };
  });

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
        {/* Track Background */}
        <circle 
          cx={center} cy={center} r={radius} 
          fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} 
        />
        
        {/* Core genome loop */}
        <circle 
          cx={center} cy={center} r={radius} 
          fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" 
        />

        {/* GC Content Visualization */}
        <path
          d={`M ${center + radius} ${center} A ${radius} ${radius} 0 1 1 ${center - radius} ${center} A ${radius} ${radius} 0 1 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={`${(gcContent / 100) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
          strokeLinecap="round"
          className="opacity-20"
        />

        {/* GC Skew Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill={p.color} className="transition-all hover:r-4 cursor-pointer" />
        ))}

        {/* Label in center */}
        <text x={center} y={center} textAnchor="middle" className="font-black fill-slate-900 text-3xl">
          {gcContent.toFixed(1)}%
        </text>
        <text x={center} y={center + 20} textAnchor="middle" className="font-bold fill-slate-400 text-xs uppercase tracking-widest">
          GC Content
        </text>
      </svg>
      
      <div className="absolute top-0 right-0 p-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>GC+</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>GC-</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularMap;
