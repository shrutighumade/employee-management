import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee, CreateEmployeePayload } from '../../models/employee.model';
import { EmployeeFormComponent } from '../employee-form/employee-form';

@Component({
  selector: 'app-employee-list',
  imports: [
    FormsModule,
    CurrencyPipe,
    EmployeeFormComponent
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-block'
  }
})
export class EmployeeListComponent implements OnInit {
  protected readonly employeeService = inject(EmployeeService);

  readonly employees = this.employeeService.filteredEmployees;
  readonly loading = this.employeeService.loading;
  readonly searchInput = signal<string>('');

  readonly isFormOpen = signal<boolean>(false);
  readonly selectedForEdit = signal<Employee | null>(null);
  readonly isSaving = signal<boolean>(false);

  ngOnInit(): void {
    this.employeeService.loadEmployees().subscribe();
  }

  onSearchChange(query: string): void {
    this.searchInput.set(query);
    this.employeeService.setSearchQuery(query);
  }

  openAddModal(): void {
    this.selectedForEdit.set(null);
    this.isFormOpen.set(true);
  }

  openEditModal(employee: Employee): void {
    this.selectedForEdit.set(employee);
    this.isFormOpen.set(true);
  }

  closeModal(): void {
    this.isFormOpen.set(false);
    this.selectedForEdit.set(null);
  }

  onSaveEmployee(payload: CreateEmployeePayload): void {
    this.isSaving.set(true);
    const editingEmp = this.selectedForEdit();

    if (editingEmp) {
      this.employeeService.updateEmployee(editingEmp.id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.employeeService.createEmployee(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe();
    }
  }
}
