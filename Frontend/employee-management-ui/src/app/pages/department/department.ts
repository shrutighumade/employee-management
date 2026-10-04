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

import { CommonModule, SlicePipe } from '@angular/common';
import { IDepartment } from '../../models/department.model';
import { DepartmentService, IPaginatedResponse } from '../../services/department.service';

@Component({
  selector: 'app-department',
  imports: [ReactiveFormsModule, CommonModule, SlicePipe],
  templateUrl: './department.html',
  styleUrl: './department.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Department implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly destroyRef = inject(DestroyRef);

  // UI State
  protected readonly departments = signal<IDepartment[]>([]);
  protected readonly isDrawerOpen = signal(false);
  protected readonly editingIndex = signal<number | null>(null);
  protected readonly deleteConfirmIndex = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly serverError = signal<string | null>(null);

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(1);

  // Search
  protected readonly searchQuery = signal('');

  private readonly searchSubject = new Subject<string>();
  private readonly refreshSubject = new Subject<void>();

  // Form
  protected readonly departmentForm = this.fb.nonNullable.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    location: ['', Validators.maxLength(200)],
  });

  ngOnInit(): void {
    this.setupStream();
    this.refreshSubject.next();
  }

  // =========================
  // Data Stream
  // =========================

  private setupStream(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((search) => {
          this.searchQuery.set(search);
          this.currentPage.set(1);
          this.errorMessage.set(null);
        }),
        switchMap(() => this.loadDepartments$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.refreshSubject
      .pipe(
        switchMap(() => this.loadDepartments$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private loadDepartments$() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.departmentService
      .getDepartments(this.currentPage(), this.pageSize(), this.searchQuery())
      .pipe(
        tap((response: IPaginatedResponse<IDepartment>) => {
          this.departments.set(response.items ?? []);
          this.totalCount.set(response.totalCount ?? 0);
          this.totalPages.set(response.totalPages || 1);
        }),
        catchError(() => {
          this.departments.set([]);
          this.totalCount.set(0);
          this.totalPages.set(1);
          this.errorMessage.set('Could not load departments. Check API connection.');
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  private refresh(): void {
    this.refreshSubject.next();
  }

  // =========================
  // Computed Metrics
  // =========================

  protected readonly totalEmployees = computed(() =>
    this.departments().reduce((sum, d) => sum + (d.employeeCount || 0), 0),
  );

  // =========================
  // Pagination
  // =========================

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.refresh();
  }

  protected prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected get pagesArray(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
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
    this.serverError.set(null);
    this.isDrawerOpen.set(true);
  }

  protected editDepartment(index: number): void {
    const dept = this.departments()[index];
    if (!dept) return;

    this.departmentForm.patchValue({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      location: dept.location,
    });

    this.editingIndex.set(index);
    this.serverError.set(null);
    this.isDrawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.resetForm();
    this.serverError.set(null);
  }

  // =========================
  // Save
  // =========================

  protected saveDepartment(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.departmentForm.getRawValue();
    const editingIndex = this.editingIndex();

    if (editingIndex === null) {
      this.create(formValue);
    } else {
      this.update(editingIndex, formValue);
    }
  }

  private create(formValue: ReturnType<typeof this.departmentForm.getRawValue>): void {
    const payload = {
      name: formValue.name,
      description: formValue.description,
      location: formValue.location,
    };

    this.departmentService
      .createDepartment(payload)
      .pipe(
        tap(() => {
          this.closeDrawer();
          this.refresh();
        }),
        catchError((error) => {
          this.serverError.set(error?.error?.message ?? 'Failed to create department.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private update(
    index: number,
    formValue: ReturnType<typeof this.departmentForm.getRawValue>,
  ): void {
    const dept = this.departments()[index];
    if (!dept?.id) return;

    const payload = {
      name: formValue.name,
      description: formValue.description,
      location: formValue.location,
    };

    this.departmentService
      .updateDepartment(dept.id, payload)
      .pipe(
        tap(() => {
          this.closeDrawer();
          this.refresh();
        }),
        catchError((error) => {
          this.serverError.set(error?.error?.message ?? 'Failed to update department.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // =========================
  // Delete
  // =========================

  protected promptDelete(index: number): void {
    this.deleteConfirmIndex.set(index);
  }

  protected cancelDelete(): void {
    this.deleteConfirmIndex.set(null);
  }

  protected confirmDelete(): void {
    const index = this.deleteConfirmIndex();
    if (index === null) return;
    this.deleteDepartment(index);
    this.deleteConfirmIndex.set(null);
  }

  private deleteDepartment(index: number): void {
    const dept = this.departments()[index];
    if (!dept?.id) return;

    this.departmentService
      .deleteDepartment(dept.id)
      .pipe(
        tap(() => this.refresh()),
        catchError((error) => {
          this.errorMessage.set(error?.error?.message ?? 'Failed to delete department.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // =========================
  // Form
  // =========================

  protected resetForm(): void {
    this.departmentForm.reset({
      id: 0,
      name: '',
      description: '',
      location: '',
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
    if (!name) return 'DP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
}
