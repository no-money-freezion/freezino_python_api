import { describe, it, expect } from 'vitest';

import LoadingSpinner from './LoadingSpinner';
import { render } from '../test/utils';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with default medium size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="text-primary" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner).toHaveClass('text-primary');
  });

  it('contains SVG element', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
