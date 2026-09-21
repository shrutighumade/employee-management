import { TestBed } from '@angular/core/testing';
import { NavRegistryService } from './nav-registry.service';
import { NavItem } from '../models/nav-item.model';

describe('NavRegistryService', () => {
  let service: NavRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavRegistryService]
    });
    service = TestBed.inject(NavRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial navigation items sorted by order', () => {
    const items = service.navItems();
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0].id).toBe('employees');
    expect(items[1].id).toBe('users');
  });

  it('should allow registering new navigation items', () => {
    const newItem: NavItem = {
      id: 'departments',
      label: 'Departments',
      route: '/departments',
      icon: 'business',
      module: 'department',
      order: 3
    };

    service.registerNavItem(newItem);
    const items = service.navItems();
    expect(items.find(i => i.id === 'departments')).toBeDefined();
  });

  it('should allow unregistering navigation items', () => {
    service.unregisterNavItem('users');
    const items = service.navItems();
    expect(items.find(i => i.id === 'users')).toBeUndefined();
  });
});
