import { describe, it, expect } from 'vitest';

import LoadingSpinner from './LoadingSpinner';
import { render } from '../test/utils';

describe('LoadingSpinner Snapshots', () => {
  it('should match snapshot for small spinner', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot for medium spinner', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot for large spinner', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with custom className', () => {
    const { container } = render(
      <LoadingSpinner size="md" className="text-primary" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
