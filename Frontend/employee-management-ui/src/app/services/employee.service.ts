import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface IEmployee {
  id?: number;
  name: string;
  employeId: number;
  employeSalary: number;
  leavesCount: number;
  joingDate: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Employees`;

  getEmployees(page: number = 1, pageSize: number = 5, search: string = ''): Observable<IPaginatedResponse<IEmployee>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<IPaginatedResponse<IEmployee>>(this.apiUrl, { params });
  }

  getEmployeeById(id: number): Observable<IEmployee> {
    return this.http.get<IEmployee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Omit<IEmployee, 'id'>): Observable<IEmployee> {
    return this.http.post<IEmployee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Partial<IEmployee>): Observable<IEmployee> {
    return this.http.put<IEmployee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
