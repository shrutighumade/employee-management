import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterModule],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFound {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  protected goBack(): void {
    this.location.back();
  }

  protected goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
