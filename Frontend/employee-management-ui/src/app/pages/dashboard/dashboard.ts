import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected userName = 'User';

  public ngOnInit(): void {
    this.authService
      .getProfile()
      .pipe(
        tap((user) => {
          this.userName = user.name;
        }),
        catchError((error) => {
          console.error('Error fetching profile:', error);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  protected logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
