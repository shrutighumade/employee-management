import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { IEmployee, IPaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Employees`;

  public getEmployees(
    page: number = 1,
    pageSize: number = 5,
    search: string = '',
  ): Observable<IPaginatedResponse<IEmployee>> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<IPaginatedResponse<IEmployee>>(this.apiUrl, { params });
  }

  public getEmployeeById(id: number): Observable<IEmployee> {
    return this.http.get<IEmployee>(`${this.apiUrl}/${id}`);
  }

  public createEmployee(employee: Omit<IEmployee, 'id'>): Observable<IEmployee> {
    return this.http.post<IEmployee>(this.apiUrl, employee);
  }

  public updateEmployee(id: number, employee: Partial<IEmployee>): Observable<IEmployee> {
    return this.http.put<IEmployee>(`${this.apiUrl}/${id}`, employee);
  }

  public deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
