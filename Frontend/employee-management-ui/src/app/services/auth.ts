import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  public register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  public login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  public forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  public resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  public getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }
}
