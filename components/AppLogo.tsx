import React from 'react';

export const AppLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background Shield Outline */}
    <path 
      d="M50 4 L92 18 L92 58 C92 90 50 116 50 116 C50 116 8 90 8 58 L8 18 L50 4 Z" 
      fill="currentColor" 
      fillOpacity="0.05" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />
    
    {/* Inner Shield Background */}
    <path 
      d="M50 12 L84 23 L84 58 C84 84 50 106 50 106 C50 106 16 84 16 58 L16 23 L50 12 Z" 
      fill="url(#shield-bg)" 
    />
    
    {/* Vertical Stripes representing traditional Nizam crest */}
    <g fill="rgba(255, 255, 255, 0.08)">
      <rect x="25" y="30" width="4" height="60" rx="1" />
      <rect x="35" y="30" width="4" height="70" rx="1" />
      <rect x="45" y="30" width="4" height="73" rx="1" />
      <rect x="55" y="30" width="4" height="73" rx="1" />
      <rect x="65" y="30" width="4" height="70" rx="1" />
      <rect x="75" y="30" width="4" height="60" rx="1" />
    </g>

    {/* Abstract DNA Double Helix symbolizing "WGS" */}
    <g strokeWidth="4" strokeLinecap="round">
      <path d="M35 40 Q45 40 50 60 T65 80" stroke="#10B981" />
      <path d="M65 40 Q55 40 50 60 T35 80" stroke="#3B82F6" strokeOpacity="0.9" />
      
      {/* DNA Rungs */}
      <path d="M43 49 L57 49" stroke="#94A3B8" strokeWidth="2.5" />
      <path d="M39 60 L61 60" stroke="#94A3B8" strokeWidth="2.5" />
      <path d="M43 71 L57 71" stroke="#94A3B8" strokeWidth="2.5" />
    </g>
    
    {/* Top abstract element representing the classic crest lion */}
    <path 
      d="M44 2 L56 2 L50 9 Z" 
      fill="#10B981" 
      stroke="#10B981"
      strokeLinejoin="round"
      strokeWidth="2"
    />

    <defs>
      <linearGradient id="shield-bg" x1="16" y1="12" x2="84" y2="106" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
    </defs>
  </svg>
);
