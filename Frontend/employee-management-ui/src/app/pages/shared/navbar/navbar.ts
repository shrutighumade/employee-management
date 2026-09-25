import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar {
  private readonly router = inject(Router);

  protected readonly isMobileMenuOpen = signal<boolean>(false);

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(val => !val);
  }

  protected logout(): void {
    this.router.navigate(['/login']);
  }
}
