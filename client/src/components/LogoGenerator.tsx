import React from "react";

interface LogoGeneratorProps {
  brandName: string;
  domainName?: string;
  style?: "minimal" | "modern" | "bold" | "classic" | "vibrant";
  compact?: boolean;
}

export function LogoGenerator({ 
  brandName, 
  domainName, 
  style = "modern", 
  compact = false 
}: LogoGeneratorProps) {
  // Determine colors based on theme
  const themeColors = {
    minimal: { house: "#3b82f6", accent: "#1f2937", text: "#1f2937", bg: "#ffffff" },
    modern: { house: "#06b6d4", accent: "#0f172a", text: "#f8fafc", bg: "#0f172a" },
    bold: { house: "#dc2626", accent: "#7c2d12", text: "#ffffff", bg: "#ffffff" },
    classic: { house: "#7c3aed", accent: "#581c87", text: "#ffffff", bg: "#ffffff" },
    vibrant: { house: "#00d9ff", accent: "#ff006e", text: "#1a1a2e", bg: "#00d9ff" },
  };

  const colors = themeColors[style];

  // Extract domain name from brandName if not provided
  const displayDomain = domainName || (brandName.toLowerCase() === "rentapog" ? "RENTAPOG.COM" : `${brandName.toUpperCase()}.COM`);
  const domainPart = displayDomain.split('.')[0].toUpperCase();

  if (compact) {
    // Compact version - just the house icon in circle
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-lg">
        <circle cx="50" cy="50" r="48" fill={colors.bg} stroke={colors.house} strokeWidth="2" opacity="0.9" />
        
        {/* House silhouette */}
        <g fill={colors.house} opacity="0.85">
          {/* Main roof */}
          <path d="M 20 65 L 50 30 L 80 65 Z" fill={colors.house} />
          {/* Roof accent */}
          <path d="M 20 63 L 50 33 L 80 63" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
          {/* House body */}
          <rect x="25" y="65" width="50" height="22" fill={colors.accent} opacity="0.8" />
          {/* Door */}
          <rect x="42" y="70" width="6" height="12" fill={colors.house} opacity="0.6" />
          {/* Windows */}
          <rect x="32" y="72" width="4" height="4" fill={colors.house} opacity="0.6" />
          <rect x="64" y="72" width="4" height="4" fill={colors.house} opacity="0.6" />
        </g>
      </svg>
    );
  }

  // Full logo with domain name (for hero and cards)
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="160" height="140" viewBox="0 0 200 170" className="drop-shadow-lg">
        {/* Background */}
        <rect width="200" height="170" fill={colors.bg} rx="8" />

        {/* Left accent bar */}
        <rect x="0" y="0" width="14" height="170" fill={colors.accent} rx="8" />

        {/* House silhouette - main roof */}
        <path
          d="M 45 105 L 100 45 L 155 105 Z"
          fill={colors.house}
          stroke="white"
          strokeWidth="2.5"
          opacity="0.95"
        />

        {/* Roof detail line */}
        <path
          d="M 45 103 L 100 49 L 155 103"
          stroke={colors.accent}
          strokeWidth="3.5"
          fill="none"
          opacity="0.85"
        />

        {/* House body */}
        <rect
          x="52"
          y="105"
          width="96"
          height="48"
          fill={colors.accent}
          opacity="0.85"
        />

        {/* Door center */}
        <rect
          x="92"
          y="120"
          width="16"
          height="28"
          fill={colors.bg}
          opacity="0.35"
        />

        {/* Window left */}
        <rect
          x="64"
          y="120"
          width="12"
          height="12"
          fill={colors.bg}
          opacity="0.35"
        />

        {/* Window right */}
        <rect
          x="124"
          y="120"
          width="12"
          height="12"
          fill={colors.bg}
          opacity="0.35"
        />

        {/* Flag on roof */}
        <path
          d="M 100 45 L 100 35 L 118 42 Z"
          fill={colors.accent}
          opacity="0.9"
        />

        {/* Domain name text - main part */}
        <text
          x="100"
          y="158"
          textAnchor="middle"
          fontSize="24"
          fontWeight="900"
          fill={colors.text}
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          {domainPart}
        </text>

        {/* .COM suffix */}
        <text
          x="140"
          y="158"
          textAnchor="start"
          fontSize="16"
          fontWeight="700"
          fill={colors.accent}
          fontFamily="system-ui, -apple-system, sans-serif"
          opacity="0.85"
        >
          .COM
        </text>
      </svg>
    </div>
  );
}

export default LogoGenerator;
