import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="container my-4">
      <router-outlet />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-block'
  }
})
export class LayoutComponent {}
