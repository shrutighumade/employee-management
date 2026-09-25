import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface IEmployee {
  name: string;
  employeId: number;
  employeSalary: number;
  leavesCount: number;
  joingDate: string;
  dateOfBirth: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css'
})
export class Employee {
  private readonly fb = inject(FormBuilder);

  protected readonly employees = signal<IEmployee[]>([
    {
      name: 'Hrushikesh',
      employeId: 415,
      employeSalary: 30000,
      leavesCount: 26,
      joingDate: '2024-11-04',
      dateOfBirth: '2001-12-11',
      phoneNumber: '7263069877'
    },
    {
      name: 'Rahul',
      employeId: 416,
      employeSalary: 35000,
      leavesCount: 20,
      joingDate: '2023-06-10',
      dateOfBirth: '2000-05-15',
      phoneNumber: '9876543210'
    },
    {
      name: 'Amit',
      employeId: 417,
      employeSalary: 40000,
      leavesCount: 18,
      joingDate: '2022-08-20',
      dateOfBirth: '1999-03-25',
      phoneNumber: '9123456780'
    }
  ]);

  protected readonly editingIndex = signal<number | null>(null);

  protected readonly employeeForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    employeId: [0, Validators.required],
    employeSalary: [0, Validators.required],
    leavesCount: [0, Validators.required],
    joingDate: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    phoneNumber: ['', Validators.required]
  });

  protected saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employee = this.employeeForm.getRawValue();
    const index = this.editingIndex();

    if (index === null) {
      this.employees.update(emps => [...emps, employee]);
    } else {
      this.employees.update(emps =>
        emps.map((emp, i) => (i === index ? employee : emp))
      );
    }

    this.resetForm();
  }

  protected editEmployee(index: number): void {
    const employee = this.employees()[index];
    this.employeeForm.patchValue(employee);
    this.editingIndex.set(index);
  }

  protected deleteEmployee(index: number): void {
    this.employees.update(emps => emps.filter((_, i) => i !== index));

    if (this.editingIndex() === index) {
      this.resetForm();
    }
  }

  protected resetForm(): void {
    this.employeeForm.reset({
      name: '',
      employeId: 0,
      employeSalary: 0,
      leavesCount: 0,
      joingDate: '',
      dateOfBirth: '',
      phoneNumber: ''
    });

    this.editingIndex.set(null);
  }
}
