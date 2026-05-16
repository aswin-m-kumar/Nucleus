import type { UserRole } from '../types';

export const getDashboardRoute = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'manager':
      return '/manager';
    case 'employee':
    default:
      return '/dashboard';
  }
};
