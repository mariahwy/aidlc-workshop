import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoleGuard from './RoleGuard';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderGuard(requiredRole?: 'owner' | 'staff') {
  return render(
    <MemoryRouter>
      <RoleGuard requiredRole={requiredRole}>
        <div data-testid="protected-content">Protected</div>
      </RoleGuard>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  it('shows content for authenticated user without role requirement', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'staff' } });
    renderGuard();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects unauthenticated user', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
    renderGuard();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects staff from owner-only route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'staff' } });
    renderGuard('owner');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('allows owner to access owner-only route', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'owner' } });
    renderGuard('owner');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  // PBT: staff can never access owner-only routes
  it('property: staff role never sees owner-only content', () => {
    fc.assert(
      fc.property(fc.constant('staff'), () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'staff' } });
        const { container } = renderGuard('owner');
        const hasContent = container.querySelector('[data-testid="protected-content"]');
        return hasContent === null;
      }),
    );
  });
});
