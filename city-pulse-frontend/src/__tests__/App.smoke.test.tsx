import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('App (smoke)', () => {
  beforeEach(() => {
    // @ts-expect-error test env
    global.fetch = vi.fn((url: string) => {
      if (url.toString().endsWith('/health')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: 'ok' }) });
      }
      // reports list
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without showing network error when health ok', async () => {
    render(<App />);
    await waitFor(() => expect(screen.queryByText('Connection Error')).not.toBeInTheDocument());
  });
});


