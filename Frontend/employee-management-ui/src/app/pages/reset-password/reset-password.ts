import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected isSubmitting = false;

  private resetToken = '';

  protected resetPasswordForm = this.fb.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],

    confirmPassword: [
      '',
      [
        Validators.required
      ]
    ],
  });

  constructor() {
    this.resetToken =
      this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  protected onSubmit(): void {
    if (this.resetPasswordForm.invalid || this.isSubmitting) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.resetToken) {
      alert('Invalid or missing reset token.');
      return;
    }

    const newPassword =
      this.resetPasswordForm.controls.newPassword.value;

    const confirmPassword =
      this.resetPasswordForm.controls.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (!newPassword) {
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword({
      token: this.resetToken,
      newPassword: newPassword
    }).pipe(

      tap((response) => {
        alert(response.message);

        this.router.navigate(['/login']);
      }),

      catchError((error) => {
        console.error(
          'Reset Password Failed:',
          error
        );

        alert(
          error?.error?.message ??
          'Unable to reset password. Please try again.'
        );

        return EMPTY;
      }),

      finalize(() => {
        this.isSubmitting = false;
      })

    ).subscribe();
  }
}
