import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { EmployeeService, IEmployee } from '../../services/employee.service';

@Component({
  selector: 'app-employee',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Employee implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  // UI State
  protected readonly employees = signal<IEmployee[]>([]);
  protected readonly isDrawerOpen = signal(false);
  protected readonly editingIndex = signal<number | null>(null);
  protected readonly deleteConfirmIndex = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);

  // Search
  protected readonly searchQuery = signal('');

  private readonly searchSubject = new Subject<string>();
  private readonly refreshSubject = new Subject<void>();

  // Reactive Form
  protected readonly employeeForm = this.fb.nonNullable.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(2)]],
    employeId: [0, [Validators.required, Validators.min(1)]],
    employeSalary: [0, [Validators.required, Validators.min(0)]],
    leavesCount: [0, [Validators.required, Validators.min(0)]],
    joingDate: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  });

  ngOnInit(): void {
    this.setupEmployeeStream();
    this.refreshSubject.next();
  }

  // =========================
  // Employee API Stream
  // =========================

  private setupEmployeeStream(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),

        tap((search) => {
          this.searchQuery.set(search);
          this.currentPage.set(1);
          this.errorMessage.set(null);
        }),

        switchMap(() => this.loadEmployees$()),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.refreshSubject
      .pipe(
        switchMap(() => this.loadEmployees$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private loadEmployees$() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.employeeService
      .getEmployees(this.currentPage(), this.pageSize(), this.searchQuery())
      .pipe(
        tap((response) => {
          if (response && !Array.isArray(response)) {
            this.employees.set(response.items ?? []);
            this.totalCount.set(response.totalCount ?? 0);
            this.totalPages.set(response.totalPages || 1);

            return;
          }

          if (Array.isArray(response)) {
            const employees = response as IEmployee[];

            this.employees.set(employees.slice(0, this.pageSize()));
            this.totalCount.set(employees.length);
            this.totalPages.set(Math.ceil(employees.length / this.pageSize()) || 1);
          }
        }),

        catchError(() => {
          this.employees.set([]);
          this.totalCount.set(0);
          this.totalPages.set(1);

          this.errorMessage.set('Could not load employees from server. Check API connection.');

          return of(null);
        }),

        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  private refreshEmployees(): void {
    this.refreshSubject.next();
  }

  // =========================
  // Computed Metrics
  // =========================

  protected readonly totalPayroll = computed(() =>
    this.employees().reduce((sum, employee) => sum + Number(employee.employeSalary || 0), 0),
  );

  protected readonly avgSalary = computed(() => {
    const count = this.employees().length;

    return count > 0 ? Math.round(this.totalPayroll() / count) : 0;
  });

  protected readonly totalLeavesCount = computed(() =>
    this.employees().reduce((sum, employee) => sum + Number(employee.leavesCount || 0), 0),
  );

  // =========================
  // Pagination
  // =========================

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.refreshEmployees();
  }

  protected prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected get pagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  }

  // =========================
  // Search
  // =========================

  protected updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchSubject.next(input.value.trim());
  }

  protected clearSearch(): void {
    this.searchSubject.next('');
  }

  // =========================
  // Drawer
  // =========================

  protected openAddDrawer(): void {
    this.resetForm();
    this.editingIndex.set(null);
    this.isDrawerOpen.set(true);
  }

  protected editEmployee(index: number): void {
    const employee = this.employees()[index];

    if (!employee) {
      return;
    }

    this.employeeForm.patchValue({
      id: employee.id || 0,
      name: employee.name,
      employeId: employee.employeId,
      employeSalary: employee.employeSalary,
      leavesCount: employee.leavesCount,
      joingDate: employee.joingDate,
      dateOfBirth: employee.dateOfBirth,
      phoneNumber: employee.phoneNumber,
    });

    this.editingIndex.set(index);
    this.isDrawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.resetForm();
  }

  // =========================
  // Save Employee
  // =========================

  protected saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.employeeForm.getRawValue();
    const editingIndex = this.editingIndex();

    if (editingIndex === null) {
      this.createEmployee(formValue);
      return;
    }

    this.updateEmployee(editingIndex, formValue);
  }

  private createEmployee(formValue: ReturnType<typeof this.employeeForm.getRawValue>): void {
    const payload = {
      name: formValue.name,
      employeId: formValue.employeId,
      employeSalary: formValue.employeSalary,
      leavesCount: formValue.leavesCount,
      joingDate: formValue.joingDate,
      dateOfBirth: formValue.dateOfBirth,
      phoneNumber: formValue.phoneNumber,
    };

    this.employeeService
      .createEmployee(payload)
      .pipe(
        tap(() => {
          this.closeDrawer();
          this.refreshEmployees();
        }),
        catchError((error) => {
          console.error('Error creating employee:', error);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private updateEmployee(
    index: number,
    formValue: ReturnType<typeof this.employeeForm.getRawValue>,
  ): void {
    const employee = this.employees()[index];

    if (!employee?.id) {
      return;
    }

    const payload: IEmployee = {
      id: employee.id,
      name: formValue.name,
      employeId: formValue.employeId,
      employeSalary: formValue.employeSalary,
      leavesCount: formValue.leavesCount,
      joingDate: formValue.joingDate,
      dateOfBirth: formValue.dateOfBirth,
      phoneNumber: formValue.phoneNumber,
    };

    this.employeeService
      .updateEmployee(employee.id, payload)
      .pipe(
        tap(() => {
          this.closeDrawer();
          this.refreshEmployees();
        }),
        catchError((error) => {
          console.error('Error updating employee:', error);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // =========================
  // Delete Employee
  // =========================

  protected promptDelete(index: number): void {
    this.deleteConfirmIndex.set(index);
  }

  protected cancelDelete(): void {
    this.deleteConfirmIndex.set(null);
  }

  protected confirmDelete(): void {
    const index = this.deleteConfirmIndex();

    if (index === null) {
      return;
    }

    this.deleteEmployee(index);
    this.deleteConfirmIndex.set(null);
  }

  private deleteEmployee(index: number): void {
    const employee = this.employees()[index];

    if (!employee?.id) {
      return;
    }

    this.employeeService
      .deleteEmployee(employee.id)
      .pipe(
        tap(() => {
          this.refreshEmployees();
        }),
        catchError((error) => {
          console.error('Error deleting employee:', error);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    if (this.editingIndex() === index) {
      this.closeDrawer();
    }
  }

  // =========================
  // Form
  // =========================

  protected resetForm(): void {
    this.employeeForm.reset({
      id: 0,
      name: '',
      employeId: 0,
      employeSalary: 0,
      leavesCount: 0,
      joingDate: '',
      dateOfBirth: '',
      phoneNumber: '',
    });

    this.editingIndex.set(null);
  }

  // =========================
  // UI Helpers
  // =========================

  protected getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    ];

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  protected getInitials(name: string): string {
    if (!name) {
      return 'EM';
    }

    const parts = name.trim().split(' ');

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }
}
