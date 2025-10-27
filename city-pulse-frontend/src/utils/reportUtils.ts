import { icon } from "leaflet";
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

// Get category icon
export const getCategoryIcon = (category: ReportCategory): string => {
    const icons: Record<ReportCategory, string> = {
        POTHOLE: '🕳️',
        WASTE: '🗑️',
        POLLUTION: '☣️',
        LIGHTING: '💡',
        VANDALISM: '🔨',
        OTHER: '⚠️'
    };
    return icons[category];
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
    const baseSize = 32;
    const sizeIncrease = Math.min(Math.floor(upvotes / 5) * 2, 16); // Max +16px
    return baseSize + sizeIncrease;
};