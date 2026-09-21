import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-users-placeholder',
  template: `
    <div class="card p-4 text-center my-5 shadow-sm">
      <div class="my-3 text-warning">
        <i class="fa-solid fa-user-gear fa-3x"></i>
      </div>
      <h3>User Management Module</h3>
      <p class="text-muted">This page is reserved for User CRUD assigned to Developer 2.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPlaceholderComponent {}
