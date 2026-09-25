import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runInInjectionContext, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Employee } from './employee';
import { EmployeeService, IEmployee } from '../../services/employee.service';

describe('Employee Component', () => {
  let component: Employee;
  let mockEmployeeService: any;
  let formBuilder: FormBuilder;

  const sampleEmployees: IEmployee[] = [
    { id: 1, name: 'Hrushikesh', employeId: 415, employeSalary: 30000, leavesCount: 26, joingDate: '2024-11-04', dateOfBirth: '2001-12-11', phoneNumber: '7263069877' },
    { id: 2, name: 'Rahul', employeId: 416, employeSalary: 35000, leavesCount: 20, joingDate: '2023-06-10', dateOfBirth: '2000-05-15', phoneNumber: '9876543210' }
  ];

  beforeEach(() => {
    formBuilder = new FormBuilder();
    mockEmployeeService = {
      getEmployees: vi.fn().mockReturnValue(of({ items: sampleEmployees, totalCount: 2, page: 1, pageSize: 5, totalPages: 1 })),
      createEmployee: vi.fn().mockReturnValue(of({ id: 3, name: 'New Employee', employeId: 417, employeSalary: 40000, leavesCount: 15, joingDate: '2025-01-01', dateOfBirth: '1995-01-01', phoneNumber: '9000000000' })),
      updateEmployee: vi.fn().mockReturnValue(of({ id: 1, name: 'Hrushikesh Updated', employeId: 415, employeSalary: 35000, leavesCount: 25, joingDate: '2024-11-04', dateOfBirth: '2001-12-11', phoneNumber: '7263069877' })),
      deleteEmployee: vi.fn().mockReturnValue(of(null))
    };

    const mockInjector = Injector.create({
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        { provide: EmployeeService, useValue: mockEmployeeService }
      ]
    });

    runInInjectionContext(mockInjector, () => {
      component = new Employee();
    });
  });

  it('should instantiate component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute metrics correctly from state', () => {
    (component as any).employees.set(sampleEmployees);

    expect((component as any).employees().length).toBe(2);
    expect((component as any).totalPayroll()).toBe(65000);
    expect((component as any).avgSalary()).toBe(32500);
    expect((component as any).totalLeavesCount()).toBe(46);
  });

  it('should handle pagination controls correctly', () => {
    (component as any).totalPages.set(3);
    (component as any).currentPage.set(1);

    (component as any).nextPage();
    expect((component as any).currentPage()).toBe(2);

    (component as any).prevPage();
    expect((component as any).currentPage()).toBe(1);
  });

  it('should open and close add employee drawer', () => {
    (component as any).openAddDrawer();
    expect((component as any).isDrawerOpen()).toBe(true);
    expect((component as any).editingIndex()).toBeNull();

    (component as any).closeDrawer();
    expect((component as any).isDrawerOpen()).toBe(false);
  });

  it('should generate initials correctly', () => {
    expect((component as any).getInitials('Hrushikesh Sharma')).toBe('HS');
    expect((component as any).getInitials('John')).toBe('JO');
    expect((component as any).getInitials('')).toBe('EM');
  });
});
