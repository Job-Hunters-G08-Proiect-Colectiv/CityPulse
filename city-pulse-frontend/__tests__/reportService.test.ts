import { reportService } from '../services/reportService';
import { API_ENDPOINTS } from '../config/api';

describe('reportService', () => {
  beforeEach(() => {
    // @ts-expect-error test env
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls GET /api/reports and returns parsed json', async () => {
    const mockReports = [];
    // @ts-expect-error test env
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockReports) });

    const data = await reportService.getAllReports();
    expect(global.fetch).toHaveBeenCalledWith(API_ENDPOINTS.REPORTS);
    expect(data).toEqual(mockReports);
  });

  it('appends filters as query params', async () => {
    // @ts-expect-error test env
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await reportService.getAllReports({ category: 'TRAFFIC', status: 'OPEN', severityLevel: 'HIGH', search: 'foo' } as any);
    const calledUrl: string = (global.fetch as any).mock.calls[0][0];
    expect(calledUrl).toContain('category=TRAFFIC');
    expect(calledUrl).toContain('status=OPEN');
    expect(calledUrl).toContain('severity=HIGH');
    expect(calledUrl).toContain('search=foo');
  });
});


