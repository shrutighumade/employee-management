import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { IDepartment } from '../models/department.model';

export interface IPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Departments`;

  public getDepartments(
    page: number = 1,
    pageSize: number = 5,
    search: string = '',
  ): Observable<IPaginatedResponse<IDepartment>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<IPaginatedResponse<IDepartment>>(this.apiUrl, { params });
  }

  public getDepartmentById(id: number): Observable<IDepartment> {
    return this.http.get<IDepartment>(`${this.apiUrl}/${id}`);
  }

  public createDepartment(dto: { name: string; description: string; location: string }): Observable<IDepartment> {
    return this.http.post<IDepartment>(this.apiUrl, dto);
  }

  public updateDepartment(id: number, dto: { name: string; description: string; location: string }): Observable<IDepartment> {
    return this.http.put<IDepartment>(`${this.apiUrl}/${id}`, dto);
  }

  public deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
