import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  protected isSubmitting = false;

  protected forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.forgotPasswordForm.invalid || this.isSubmitting) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.controls.email.value;

    if (!email) {
      return;
    }

    this.isSubmitting = true;

    this.authService.forgotPassword(email).pipe(
      tap((response) => {
        alert(response.message);
      }),

      catchError((error) => {
        console.error('Forgot Password Failed:', error);

        alert('Unable to process your request. Please try again.');

        return EMPTY;
      }),

      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe();
  }
}
