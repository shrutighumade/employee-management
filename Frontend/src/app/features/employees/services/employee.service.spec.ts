import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { Employee } from '../models/employee.model';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  const mockEmployees: Employee[] = [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@company.com',
      phone: '+1 555 1234',
      department: 'Engineering',
      position: 'Senior Frontend Developer',
      salary: 115000,
      dateOfJoining: '2022-03-15',
      isActive: true
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      fullName: 'Michael Chen',
      email: 'michael.chen@company.com',
      phone: '+1 555 5678',
      department: 'Engineering',
      position: 'Tech Lead',
      salary: 135000,
      dateOfJoining: '2021-06-01',
      isActive: true
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load employees from API and update signals', () => {
    service.loadEmployees().subscribe(res => {
      expect(res.items.length).toBe(2);
      expect(service.employees().length).toBe(2);
    });

    const req = httpMock.expectOne(req => req.url.includes('/api/employees'));
    expect(req.request.method).toBe('GET');
    req.flush({
      items: mockEmployees,
      totalCount: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1
    });
  });

  it('should filter employees locally using computed signal', () => {
    service.employees.set(mockEmployees);
    service.setSearchQuery('Michael');
    expect(service.filteredEmployees().length).toBe(1);
    expect(service.filteredEmployees()[0].firstName).toBe('Michael');
  });

  it('should create an employee', () => {
    const newPayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@company.com',
      phone: '123456789',
      department: 'Design',
      position: 'UI Designer',
      salary: 90000,
      dateOfJoining: '2023-01-01',
      isActive: true
    };

    const createdEmp: Employee = { ...newPayload, id: 3, fullName: 'Jane Doe' };

    service.createEmployee(newPayload).subscribe(res => {
      expect(res.id).toBe(3);
    });

    const req = httpMock.expectOne('http://localhost:5081/api/employees');
    expect(req.request.method).toBe('POST');
    req.flush(createdEmp);

    // Also expect loadStats call triggered after create
    const statsReq = httpMock.expectOne('http://localhost:5081/api/employees/stats');
    statsReq.flush({});
  });
});
