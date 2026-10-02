import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { tap } from 'rxjs';
import { Navbar } from './pages/shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router);
  protected readonly title = signal('employee-management-ui');

  protected readonly isNavbarVisible = signal(true);

  public ngOnInit() {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];

    this.router.events
      .pipe(
        tap(() => {
          const currentUrl = this.router.url;
          this.isNavbarVisible.set(!authPages.includes(currentUrl));
        }),
      )
      .subscribe();
  }
}
