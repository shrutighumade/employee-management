import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected isSubmitting = false;

  protected loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);

          alert(response.message || 'Login successful!');

          this.router.navigate(['/dashboard']);
        }),

        catchError((error) => {
          alert(error.error?.message || 'Invalid email or password');

          console.error('Login Failed!', error);

          return EMPTY;
        }),

        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe();
  }
}
