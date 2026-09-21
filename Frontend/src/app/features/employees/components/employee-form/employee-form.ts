import { Component, ChangeDetectionStrategy, inject, input, output, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Employee, CreateEmployeePayload } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-block'
  }
})
export class EmployeeFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly employee = input<Employee | null>(null);
  readonly isOpen = input<boolean>(false);
  readonly isSaving = input<boolean>(false);

  readonly save = output<CreateEmployeePayload>();
  readonly close = output<void>();

  readonly form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department: ['', [Validators.required]],
    position: ['', [Validators.required]],
    salary: [50000, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      const emp = this.employee();
      if (emp) {
        this.form.patchValue({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          position: emp.position,
          salary: emp.salary
        });
      } else {
        this.form.reset({
          salary: 50000
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const payload: CreateEmployeePayload = {
      firstName: val.firstName || '',
      lastName: val.lastName || '',
      email: val.email || '',
      phone: val.phone || '',
      department: val.department || '',
      position: val.position || '',
      salary: Number(val.salary) || 0,
      dateOfJoining: new Date().toISOString(),
      isActive: true
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.close.emit();
  }
}
