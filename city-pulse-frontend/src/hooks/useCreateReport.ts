import { useState } from 'react';
import { reportService, type CreateReportDto } from '../services/reportService';
import type { Report } from '../types/report';

export const useCreateReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = async (data: CreateReportDto): Promise<Report | null> => {
    try {
      setLoading(true);
      setError(null);
      const report = await reportService.createReport(data);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReport, loading, error };
};