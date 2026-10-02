import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './pages/shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('employee-management-ui');

  protected readonly isNavbarVisible = signal(true);

  constructor(private router: Router) {

    const authPages = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password'
    ];

    this.router.events.subscribe(() => {

      const currentUrl = this.router.url;

      this.isNavbarVisible.set(
        !authPages.includes(currentUrl)
      );

    });

  }
}
