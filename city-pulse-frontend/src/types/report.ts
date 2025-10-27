export type ReportCategory = 'POTHOLE' | 'WASTE' | 'POLLUTION' | 'LIGHTING' | 'VANDALISM' | 'OTHER';

export type ReportStatus = 'PENDING' | 'WORKING' | 'PLANNING' | 'DONE';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const severityToIntensity = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 1.0,
  CRITICAL: 1.5
};

export interface Location {
  lat: number;
  lng: number;
}

export interface Report {
  id: number;
  name: string;
  date: string;
  location: Location;
  address: string;
  category: ReportCategory;
  images: string[];
  status: ReportStatus;
  severityLevel: SeverityLevel;
  upvotes: number;
  description?: string;
}