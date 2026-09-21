import { Injectable, signal, computed } from '@angular/core';
import { NavItem } from '../models/nav-item.model';

@Injectable({
  providedIn: 'root'
})
export class NavRegistryService {
  private readonly navItemsSignal = signal<NavItem[]>([
    {
      id: 'employees',
      label: 'Employee Management',
      route: '/employees',
      icon: 'fa-solid fa-users-gear',
      module: 'employee',
      order: 1
    },
    {
      id: 'users',
      label: 'User Management',
      route: '/users',
      icon: 'fa-solid fa-user-shield',
      module: 'user',
      badge: 'Dev 2 Module',
      badgeType: 'warning',
      order: 2
    }
  ]);

  readonly navItems = computed(() =>
    [...this.navItemsSignal()].sort((a, b) => a.order - b.order)
  );

  registerNavItem(item: NavItem): void {
    this.navItemsSignal.update(items => {
      const existingIndex = items.findIndex(i => i.id === item.id);
      if (existingIndex !== -1) {
        const updated = [...items];
        updated[existingIndex] = item;
        return updated;
      }
      return [...items, item];
    });
  }

  unregisterNavItem(id: string): void {
    this.navItemsSignal.update(items => items.filter(item => item.id !== id));
  }
}
