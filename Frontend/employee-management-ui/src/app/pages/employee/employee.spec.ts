import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Employee } from './employee';

beforeAll(() => {
  try {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );
  } catch {
    // Environment already initialized
  }
});

describe('Employee Component', () => {
  let component: Employee;
  let fixture: ComponentFixture<Employee>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Employee]
    }).compileComponents();

    fixture = TestBed.createComponent(Employee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the employee component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default employees', () => {
    const employees = (component as any).employees();
    expect(employees.length).toBe(3);
    expect(employees[0].name).toBe('Hrushikesh');
  });

  it('should compute metrics correctly', () => {
    expect((component as any).totalEmployeesCount()).toBe(3);
    expect((component as any).totalPayroll()).toBe(30000 + 35000 + 40000);
    expect((component as any).avgSalary()).toBe(Math.round((30000 + 35000 + 40000) / 3));
    expect((component as any).totalLeavesCount()).toBe(26 + 20 + 18);
  });

  it('should filter employees based on search query', () => {
    (component as any).searchQuery.set('Rahul');
    expect((component as any).filteredEmployees().length).toBe(1);
    expect((component as any).filteredEmployees()[0].name).toBe('Rahul');

    (component as any).searchQuery.set('417');
    expect((component as any).filteredEmployees().length).toBe(1);
    expect((component as any).filteredEmployees()[0].name).toBe('Amit');

    (component as any).clearSearch();
    expect((component as any).filteredEmployees().length).toBe(3);
  });

  it('should open drawer and reset form when adding new employee', () => {
    (component as any).openAddDrawer();
    expect((component as any).isDrawerOpen()).toBeTrue();
    expect((component as any).editingIndex()).toBeNull();
  });

  it('should populate form when editing an employee', () => {
    (component as any).editEmployee(1);
    expect((component as any).isDrawerOpen()).toBeTrue();
    expect((component as any).editingIndex()).toBe(1);
    expect((component as any).employeeForm.getRawValue().name).toBe('Rahul');
  });

  it('should add a new employee when form is valid', () => {
    (component as any).openAddDrawer();
    (component as any).employeeForm.setValue({
      name: 'John Doe',
      employeId: 418,
      employeSalary: 50000,
      leavesCount: 15,
      joingDate: '2025-01-10',
      dateOfBirth: '1995-04-12',
      phoneNumber: '9876543211'
    });

    (component as any).saveEmployee();

    expect((component as any).employees().length).toBe(4);
    expect((component as any).employees()[3].name).toBe('John Doe');
    expect((component as any).isDrawerOpen()).toBeFalse();
  });

  it('should update an existing employee when editing', () => {
    (component as any).editEmployee(0);
    (component as any).employeeForm.patchValue({ name: 'Hrushikesh Updated' });

    (component as any).saveEmployee();

    expect((component as any).employees()[0].name).toBe('Hrushikesh Updated');
    expect((component as any).isDrawerOpen()).toBeFalse();
  });

  it('should delete employee after confirmation', () => {
    (component as any).promptDelete(1);
    expect((component as any).deleteConfirmIndex()).toBe(1);

    (component as any).confirmDelete();
    expect((component as any).employees().length).toBe(2);
    expect((component as any).deleteConfirmIndex()).toBeNull();
    expect((component as any).employees().find((e: any) => e.name === 'Rahul')).toBeUndefined();
  });

  it('should cancel delete confirmation', () => {
    (component as any).promptDelete(0);
    (component as any).cancelDelete();
    expect((component as any).deleteConfirmIndex()).toBeNull();
    expect((component as any).employees().length).toBe(3);
  });

  it('should generate initials correctly', () => {
    expect((component as any).getInitials('Hrushikesh')).toBe('HR');
    expect((component as any).getInitials('John Doe')).toBe('JD');
    expect((component as any).getInitials('')).toBe('EM');
  });
});
