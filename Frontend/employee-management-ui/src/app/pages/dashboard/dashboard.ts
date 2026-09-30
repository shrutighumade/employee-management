import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  userName = 'User';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.authService.getProfile().subscribe({
      next: (response) => {

        this.userName =
          response.name ||
          `${response.firstName} ${response.lastName}` ||
          'User';

      },

      error: (error) => {

        console.error('Profile loading failed:', error);

        if (error.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }

      }
    });

  }

  logout(): void {

    localStorage.removeItem('token');

    this.router.navigate(['/login']);

  }

}
