export type ReportCategory = 'POTHOLE' | 'WASTE' | 'POLLUTION' | 'LIGHTING' | 'VANDALISM' | 'OTHER';

export type ReportStatus = 'PENDING' | 'WORKING' | 'PLANNING' | 'DONE';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Location {
  lat: number;
  lng: number;
}

export interface Report {
  id: string;
  name: string;
  date: Date;
  location: Location;
  address: string;
  category: ReportCategory;
  images: string[];
  status: ReportStatus;
  severityLevel: SeverityLevel;
  upvotes: number;
  description?: string;
}