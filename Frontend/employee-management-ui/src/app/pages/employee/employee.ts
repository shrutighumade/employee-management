import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService, IEmployee } from '../../services/employee.service';

@Component({
  selector: 'app-employee',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Employee implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);

  // Signal State
  protected readonly employees = signal<IEmployee[]>([]);
  protected readonly searchQuery = signal<string>('');
  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly editingIndex = signal<number | null>(null);
  protected readonly deleteConfirmIndex = signal<number | null>(null);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Pagination Signals (Max 5 items per page)
  protected readonly currentPage = signal<number>(1);
  protected readonly pageSize = signal<number>(5);
  protected readonly totalCount = signal<number>(0);
  protected readonly totalPages = signal<number>(1);

  // Reactive Form
  protected readonly employeeForm = this.fb.nonNullable.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(2)]],
    employeId: [0, [Validators.required, Validators.min(1)]],
    employeSalary: [0, [Validators.required, Validators.min(0)]],
    leavesCount: [0, [Validators.required, Validators.min(0)]],
    joingDate: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  ngOnInit(): void {
    this.loadEmployeesFromApi();
  }

  protected loadEmployeesFromApi(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.employeeService
      .getEmployees(this.currentPage(), this.pageSize(), this.searchQuery())
      .subscribe({
        next: (response) => {
          if (response && Array.isArray(response.items)) {
            this.employees.set(response.items);
            this.totalCount.set(response.totalCount);
            this.totalPages.set(response.totalPages || 1);
          } else if (Array.isArray(response)) {
            // Fallback for direct array responses
            const arr = response as unknown as IEmployee[];
            this.employees.set(arr.slice(0, 5));
            this.totalCount.set(arr.length);
            this.totalPages.set(Math.ceil(arr.length / 5) || 1);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Could not load employees from server. Check API connection.');
        }
      });
  }

  // Computed Metrics
  protected readonly totalPayroll = computed(() =>
    this.employees().reduce((sum, emp) => sum + Number(emp.employeSalary || 0), 0)
  );

  protected readonly avgSalary = computed(() => {
    const count = this.employees().length;
    return count > 0 ? Math.round(this.totalPayroll() / count) : 0;
  });

  protected readonly totalLeavesCount = computed(() =>
    this.employees().reduce((sum, emp) => sum + Number(emp.leavesCount || 0), 0)
  );

  // Pagination Controls
  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadEmployeesFromApi();
    }
  }

  protected prevPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  protected get pagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  // Component Actions
  protected openAddDrawer(): void {
    this.resetForm();
    this.editingIndex.set(null);
    this.isDrawerOpen.set(true);
  }

  protected editEmployee(index: number): void {
    const employee = this.employees()[index];
    if (employee) {
      this.employeeForm.patchValue({
        id: employee.id || 0,
        name: employee.name,
        employeId: employee.employeId,
        employeSalary: employee.employeSalary,
        leavesCount: employee.leavesCount,
        joingDate: employee.joingDate,
        dateOfBirth: employee.dateOfBirth,
        phoneNumber: employee.phoneNumber
      });
      this.editingIndex.set(index);
      this.isDrawerOpen.set(true);
    }
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.resetForm();
  }

  protected updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.loadEmployeesFromApi();
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadEmployeesFromApi();
  }

  protected saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.employeeForm.getRawValue();
    const index = this.editingIndex();

    if (index === null) {
      const newEmpPayload = {
        name: formValue.name,
        employeId: formValue.employeId,
        employeSalary: formValue.employeSalary,
        leavesCount: formValue.leavesCount,
        joingDate: formValue.joingDate,
        dateOfBirth: formValue.dateOfBirth,
        phoneNumber: formValue.phoneNumber
      };

      this.employeeService.createEmployee(newEmpPayload).subscribe({
        next: () => {
          this.loadEmployeesFromApi();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Error creating employee:', err);
        }
      });
    } else {
      const currentEmp = this.employees()[index];
      const empId = currentEmp.id || formValue.id;

      const updatePayload: IEmployee = {
        id: empId,
        name: formValue.name,
        employeId: formValue.employeId,
        employeSalary: formValue.employeSalary,
        leavesCount: formValue.leavesCount,
        joingDate: formValue.joingDate,
        dateOfBirth: formValue.dateOfBirth,
        phoneNumber: formValue.phoneNumber
      };

      if (empId) {
        this.employeeService.updateEmployee(empId, updatePayload).subscribe({
          next: () => {
            this.loadEmployeesFromApi();
            this.closeDrawer();
          },
          error: (err) => {
            console.error('Error updating employee:', err);
          }
        });
      }
    }
  }

  protected promptDelete(index: number): void {
    this.deleteConfirmIndex.set(index);
  }

  protected cancelDelete(): void {
    this.deleteConfirmIndex.set(null);
  }

  protected confirmDelete(): void {
    const index = this.deleteConfirmIndex();
    if (index !== null) {
      this.deleteEmployee(index);
      this.deleteConfirmIndex.set(null);
    }
  }

  protected deleteEmployee(index: number): void {
    const targetEmp = this.employees()[index];
    if (targetEmp && targetEmp.id) {
      this.employeeService.deleteEmployee(targetEmp.id).subscribe({
        next: () => {
          this.loadEmployeesFromApi();
        },
        error: (err) => {
          console.error('Error deleting employee:', err);
        }
      });
    }

    if (this.editingIndex() === index) {
      this.closeDrawer();
    }
  }

  protected resetForm(): void {
    this.employeeForm.reset({
      id: 0,
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

  protected getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  protected getInitials(name: string): string {
    if (!name) return 'EM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
