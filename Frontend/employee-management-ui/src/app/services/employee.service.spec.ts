import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runInInjectionContext, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { EmployeeService, IEmployee, IPaginatedResponse } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    runInInjectionContext(injector, () => {
      service = new EmployeeService();
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch paginated employees via GET', () => {
    const mockResponse: IPaginatedResponse<IEmployee> = {
      items: [
        {
          id: 1,
          name: 'Hrushikesh',
          employeId: 415,
          employeSalary: 30000,
          leavesCount: 26,
          joingDate: '2024-11-04',
          dateOfBirth: '2001-12-11',
          phoneNumber: '7263069877'
        }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 5,
      totalPages: 1
    };

    mockHttpClient.get.mockReturnValue(of(mockResponse));

    service.getEmployees(1, 5, '').subscribe(res => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].name).toBe('Hrushikesh');
      expect(res.totalCount).toBe(1);
    });

    expect(mockHttpClient.get).toHaveBeenCalled();
  });

  it('should create an employee via POST', () => {
    const newEmp: Omit<IEmployee, 'id'> = {
      name: 'John Doe',
      employeId: 418,
      employeSalary: 50000,
      leavesCount: 15,
      joingDate: '2025-01-10',
      dateOfBirth: '1995-04-12',
      phoneNumber: '9876543211'
    };

    const mockCreated: IEmployee = { id: 10, ...newEmp };
    mockHttpClient.post.mockReturnValue(of(mockCreated));

    service.createEmployee(newEmp).subscribe(res => {
      expect(res.id).toBe(10);
      expect(res.name).toBe('John Doe');
    });

    expect(mockHttpClient.post).toHaveBeenCalledWith(expect.stringContaining('/api/Employees'), newEmp);
  });

  it('should delete an employee via DELETE', () => {
    mockHttpClient.delete.mockReturnValue(of(null));

    service.deleteEmployee(10).subscribe();

    expect(mockHttpClient.delete).toHaveBeenCalledWith(expect.stringContaining('/api/Employees/10'));
  });
});
