import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-stats',
  imports: [CurrencyPipe],
  template: `
    @if (stats(); as s) {
      <div class="row g-3 mb-4">
        <!-- Total Employees Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card bg-dark border-secondary-subtle shadow-sm h-100">
            <div class="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span class="text-secondary fs-7 fw-medium d-block mb-1">Total Employees</span>
                <h3 class="fw-bold text-white mb-0">{{ s.totalEmployees }}</h3>
              </div>
              <div class="rounded-3 bg-primary bg-opacity-10 text-primary p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="fa-solid fa-users fa-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Employees Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card bg-dark border-secondary-subtle shadow-sm h-100">
            <div class="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span class="text-secondary fs-7 fw-medium d-block mb-1">Active Staff</span>
                <h3 class="fw-bold text-success mb-0">{{ s.activeEmployees }}</h3>
              </div>
              <div class="rounded-3 bg-success bg-opacity-10 text-success p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="fa-solid fa-user-check fa-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Average Salary Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card bg-dark border-secondary-subtle shadow-sm h-100">
            <div class="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span class="text-secondary fs-7 fw-medium d-block mb-1">Average Salary</span>
                <h3 class="fw-bold text-info mb-0">{{ s.averageSalary | currency:'USD':'symbol':'1.0-0' }}</h3>
              </div>
              <div class="rounded-3 bg-info bg-opacity-10 text-info p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="fa-solid fa-sack-dollar fa-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Departments Count Card -->
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card bg-dark border-secondary-subtle shadow-sm h-100">
            <div class="card-body d-flex align-items-center justify-content-between p-3">
              <div>
                <span class="text-secondary fs-7 fw-medium d-block mb-1">Departments</span>
                <h3 class="fw-bold text-warning mb-0">{{ s.departmentCount }}</h3>
              </div>
              <div class="rounded-3 bg-warning bg-opacity-10 text-warning p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="fa-solid fa-building-user fa-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-block'
  }
})
export class EmployeeStatsComponent {
  private readonly employeeService = inject(EmployeeService);
  readonly stats = this.employeeService.stats;
}
