import { render, screen, fireEvent } from '@testing-library/react';
import NetworkErrorModal from '../components/NetworkErrorModal';

describe('NetworkErrorModal', () => {
  it('does not render when closed', () => {
    const { container } = render(<NetworkErrorModal open={false} onRetry={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and retry button when open and triggers onRetry', () => {
    const onRetry = vi.fn();
    render(<NetworkErrorModal open={true} onRetry={onRetry} />);

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Retry Connection/i });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});


