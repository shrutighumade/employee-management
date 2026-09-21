import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-detail',
  imports: [DatePipe, CurrencyPipe],
  template: `
    @if (isOpen() && employee(); as emp) {
      <div class="modal-backdrop fade show" (click)="close.emit()"></div>
      <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-md">
          <div class="modal-content bg-dark border-secondary-subtle text-white shadow-lg">
            <div class="modal-header border-secondary-subtle">
              <h5 class="modal-title d-flex align-items-center gap-2 fw-bold">
                <i class="fa-solid fa-address-card text-primary"></i> Employee Details
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="close.emit()" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <!-- Profile Header Card -->
              <div class="text-center mb-4">
                <div class="position-relative d-inline-block mb-3">
                  <img
                    [src]="emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'"
                    [alt]="emp.fullName"
                    class="rounded-circle border border-3 border-primary shadow"
                    width="90"
                    height="90" />
                  <span
                    class="position-absolute bottom-0 end-0 p-2 rounded-circle border border-2 border-dark"
                    [class.bg-success]="emp.isActive"
                    [class.bg-secondary]="!emp.isActive"
                    [title]="emp.isActive ? 'Active Staff' : 'Inactive Staff'"></span>
                </div>
                <h4 class="fw-bold mb-1">{{ emp.fullName }}</h4>
                <div class="badge bg-primary bg-opacity-20 text-primary border border-primary-subtle px-3 py-1 font-monospace mb-2">
                  {{ emp.position }}
                </div>
                <div class="text-secondary fs-7">
                  <i class="fa-solid fa-building me-1"></i> {{ emp.department }} Department
                </div>
              </div>

              <!-- Information Grid -->
              <div class="list-group list-group-flush border-top border-bottom border-secondary-subtle my-3">
                <div class="list-group-item bg-transparent text-white border-secondary-subtle d-flex align-items-center justify-content-between py-2">
                  <span class="text-secondary fs-7"><i class="fa-solid fa-envelope me-2 text-info"></i> Email</span>
                  <span class="fw-medium font-monospace fs-7">{{ emp.email }}</span>
                </div>
                <div class="list-group-item bg-transparent text-white border-secondary-subtle d-flex align-items-center justify-content-between py-2">
                  <span class="text-secondary fs-7"><i class="fa-solid fa-phone me-2 text-success"></i> Phone</span>
                  <span class="fw-medium font-monospace fs-7">{{ emp.phone || 'N/A' }}</span>
                </div>
                <div class="list-group-item bg-transparent text-white border-secondary-subtle d-flex align-items-center justify-content-between py-2">
                  <span class="text-secondary fs-7"><i class="fa-solid fa-dollar-sign me-2 text-warning"></i> Salary</span>
                  <span class="fw-bold text-success fs-7">{{ emp.salary | currency:'USD':'symbol':'1.0-0' }} / yr</span>
                </div>
                <div class="list-group-item bg-transparent text-white border-secondary-subtle d-flex align-items-center justify-content-between py-2">
                  <span class="text-secondary fs-7"><i class="fa-solid fa-calendar-check me-2 text-primary"></i> Date Joined</span>
                  <span class="fw-medium fs-7">{{ emp.dateOfJoining | date:'mediumDate' }}</span>
                </div>
                <div class="list-group-item bg-transparent text-white border-secondary-subtle d-flex align-items-center justify-content-between py-2">
                  <span class="text-secondary fs-7"><i class="fa-solid fa-signal me-2 text-danger"></i> Status</span>
                  <span class="badge" [class.bg-success]="emp.isActive" [class.bg-secondary]="!emp.isActive">
                    {{ emp.isActive ? 'Active Employment' : 'Inactive / On Leave' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="modal-footer border-secondary-subtle">
              <button type="button" class="btn btn-outline-info d-flex align-items-center gap-2" (click)="edit.emit(emp)">
                <i class="fa-solid fa-pen"></i> Edit Profile
              </button>
              <button type="button" class="btn btn-secondary" (click)="close.emit()">Close</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailComponent {
  readonly employee = input<Employee | null>(null);
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();
  readonly edit = output<Employee>();
}
