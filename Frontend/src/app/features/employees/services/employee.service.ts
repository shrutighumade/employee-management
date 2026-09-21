import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError, map } from 'rxjs';
import {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  EmployeeFilterParams,
  PagedResult,
  EmployeeStats
} from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5081/api/employees'; // ASP.NET Core API endpoint

  // Signal States
  readonly employees = signal<Employee[]>([]);
  readonly selectedEmployee = signal<Employee | null>(null);
  readonly stats = signal<EmployeeStats | null>(null);
  readonly departments = signal<string[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filter Signals
  readonly searchQuery = signal<string>('');
  readonly selectedDepartment = signal<string>('');
  readonly selectedStatus = signal<string>('all'); // 'all', 'active', 'inactive'
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalCount = signal<number>(0);
  readonly totalPages = signal<number>(1);

  // Derived filtered state for local computation fallback
  readonly filteredEmployees = computed(() => {
    let result = this.employees();
    const search = this.searchQuery().toLowerCase().trim();
    const dept = this.selectedDepartment();
    const status = this.selectedStatus();

    if (search) {
      result = result.filter(e =>
        e.firstName.toLowerCase().includes(search) ||
        e.lastName.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.department.toLowerCase().includes(search) ||
        e.position.toLowerCase().includes(search)
      );
    }

    if (dept) {
      result = result.filter(e => e.department === dept);
    }

    if (status !== 'all') {
      const isActive = status === 'active';
      result = result.filter(e => e.isActive === isActive);
    }

    return result;
  });

  loadEmployees(filterParams?: EmployeeFilterParams): Observable<PagedResult<Employee>> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', (filterParams?.page ?? this.currentPage()).toString())
      .set('pageSize', (filterParams?.pageSize ?? this.pageSize()).toString());

    if (filterParams?.search || this.searchQuery()) {
      params = params.set('search', filterParams?.search ?? this.searchQuery());
    }

    if (filterParams?.department || this.selectedDepartment()) {
      params = params.set('department', filterParams?.department ?? this.selectedDepartment());
    }

    if (this.selectedStatus() !== 'all') {
      params = params.set('isActive', (this.selectedStatus() === 'active').toString());
    }

    return this.http.get<PagedResult<Employee>>(this.baseUrl, { params }).pipe(
      tap(result => {
        this.employees.set(result.items);
        this.totalCount.set(result.totalCount);
        this.currentPage.set(result.page);
        this.pageSize.set(result.pageSize);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load employees');
        return of({
          items: this.employees(),
          totalCount: this.employees().length,
          page: 1,
          pageSize: 10,
          totalPages: 1
        });
      })
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    this.loading.set(true);
    return this.http.get<Employee>(`${this.baseUrl}/${id}`).pipe(
      tap(emp => {
        this.selectedEmployee.set(emp);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  createEmployee(payload: CreateEmployeePayload): Observable<Employee> {
    this.loading.set(true);
    return this.http.post<Employee>(this.baseUrl, payload).pipe(
      tap(newEmp => {
        this.employees.update(list => [newEmp, ...list]);
        this.totalCount.update(count => count + 1);
        this.loading.set(false);
        this.loadStats().subscribe();
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  updateEmployee(id: number, payload: UpdateEmployeePayload): Observable<Employee> {
    this.loading.set(true);
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(updated => {
        this.employees.update(list => list.map(e => (e.id === id ? updated : e)));
        if (this.selectedEmployee()?.id === id) {
          this.selectedEmployee.set(updated);
        }
        this.loading.set(false);
        this.loadStats().subscribe();
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  deleteEmployee(id: number): Observable<boolean> {
    this.loading.set(true);
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.employees.update(list => list.filter(e => e.id !== id));
        this.totalCount.update(count => Math.max(0, count - 1));
        this.loading.set(false);
        this.loadStats().subscribe();
      }),
      map(() => true),
      catchError(err => {
        this.loading.set(false);
        return of(false);
      })
    );
  }

  loadDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/departments`).pipe(
      tap(depts => this.departments.set(depts)),
      catchError(() => of(['Engineering', 'Human Resources', 'Product', 'Design', 'Finance', 'Marketing']))
    );
  }

  loadStats(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.baseUrl}/stats`).pipe(
      tap(s => this.stats.set(s)),
      catchError(() => {
        const list = this.employees();
        const stats: EmployeeStats = {
          totalEmployees: list.length,
          activeEmployees: list.filter(e => e.isActive).length,
          inactiveEmployees: list.filter(e => !e.isActive).length,
          averageSalary: list.length ? list.reduce((a, b) => a + b.salary, 0) / list.length : 0,
          departmentCount: new Set(list.map(e => e.department)).size,
          departments: []
        };
        this.stats.set(stats);
        return of(stats);
      })
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setDepartmentFilter(dept: string): void {
    this.selectedDepartment.set(dept);
    this.currentPage.set(1);
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }
}
