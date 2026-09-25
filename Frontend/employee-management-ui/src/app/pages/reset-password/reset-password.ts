import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {

  resetPasswordForm;

  constructor(private fb: FormBuilder) {

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],

      confirmPassword: ['', [
        Validators.required
      ]]
    });

  }

  onSubmit(): void {

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
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

    console.log('Password Reset Successfully');

    console.log({
      newPassword,
      confirmPassword
    });
  }
}
