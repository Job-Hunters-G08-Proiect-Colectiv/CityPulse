import potholeIcon from '../assets/pothole.svg';
import wasteIcon from '../assets/waste.svg';
import pollutionIcon from '../assets/pollution.svg';
import lightingIcon from '../assets/lighting.svg';
import vandalismIcon from '../assets/vandalism.svg';
import otherIcon from '../assets/other.svg';
import type { SeverityLevel, ReportCategory } from "../types/report";

// Severity Colors
export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
    LOW: "#10b981",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
    CRITICAL: "#dc2626"
};

export const getSeverityColor = (severity: SeverityLevel): string => {
    return SEVERITY_COLORS[severity];
};

// Get category icon as SVG
export const getCategoryIconPath = (category: ReportCategory): string => {
  const icons: Record<ReportCategory, string> = {
    POTHOLE: potholeIcon,
    
    // Trash bin (keeping the good one)
    WASTE: wasteIcon,
    
    // Smoke/fumes icon for pollution
    POLLUTION: pollutionIcon,
    
    // Street lamp icon
    LIGHTING: lightingIcon,
    
    // Spray paint can icon
    VANDALISM: vandalismIcon,
    
    // Alert/Warning (keeping the good one)
    OTHER: otherIcon
  };
  
  return icons[category] || otherIcon;
};

// Calculate glow size based on upvotes
export const getGlowRadius = (upvotes: number): number => {
    if (upvotes < 25) return 0;
    if (upvotes < 50) return 8;
    if (upvotes < 100) return 12;
    return 16;  // Max glow radius
};

// Calculate icon size based on upvotes
export const getIconSize = (upvotes: number): number => {
    const baseSize = 40;
    const sizeIncrease = Math.min(Math.floor(upvotes / 5) * 2, 16); // Max +16px
    return baseSize + sizeIncrease;
};