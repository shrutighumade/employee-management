import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected isEditing = false;
  protected isLoading = true;
  protected userInitials = 'U';

  protected profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  public ngOnInit(): void {

    this.authService.getProfile()
      .pipe(
        tap((user) => {

          this.profileForm.patchValue({
            firstName: user.firstName ?? user.name?.split(' ')[0] ?? '',
            lastName: user.lastName ?? user.name?.split(' ').slice(1).join(' ') ?? '',
            email: user.email ?? ''
          });

          this.updateInitials();
          this.isLoading = false;

        }),
        catchError((error) => {

          console.error('Error fetching profile:', error);
          this.isLoading = false;

          return EMPTY;
        })
      )
      .subscribe();

  }

  protected enableEdit(): void {
    this.isEditing = true;
  }

  protected cancelEdit(): void {
    this.isEditing = false;

    this.authService.getProfile()
      .pipe(
        tap((user) => {
          this.profileForm.patchValue({
            firstName: user.firstName ?? user.name?.split(' ')[0] ?? '',
            lastName: user.lastName ?? user.name?.split(' ').slice(1).join(' ') ?? '',
            email: user.email ?? ''
          });

          this.updateInitials();
        }),
        catchError((error) => {
          console.error('Error restoring profile:', error);
          return EMPTY;
        })
      )
      .subscribe();
  }

  protected saveProfile(): void {

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // Connect this method to your backend profile update API.
    // Do not display success until the API confirms the update.

  }

  protected updateInitials(): void {

    const firstName = this.profileForm.controls.firstName.value ?? '';
    const lastName = this.profileForm.controls.lastName.value ?? '';

    this.userInitials =
      (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';

  }

  protected logout(): void {

    localStorage.removeItem('token');
    this.router.navigate(['/login']);

  }

}
