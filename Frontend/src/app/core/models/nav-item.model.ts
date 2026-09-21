export interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  module: 'employee' | 'user' | 'department' | 'common';
  badge?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'primary';
  order: number;
}
