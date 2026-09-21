import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeListComponent } from './employee-list';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeService } from '../../services/employee.service';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create employee list component', () => {
    expect(component).toBeTruthy();
  });

  it('should open add modal when add button is clicked', () => {
    expect(component.isFormOpen()).toBeFalse();
    component.openAddModal();
    expect(component.isFormOpen()).toBeTrue();
    expect(component.selectedForEdit()).toBeNull();
  });

  it('should open edit modal with employee data', () => {
    const emp = {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      fullName: 'Sarah Jenkins',
      email: 'sarah@company.com',
      phone: '123',
      department: 'Engineering',
      position: 'Developer',
      salary: 100000,
      dateOfJoining: '2022-01-01',
      isActive: true
    };

    component.openEditModal(emp);
    expect(component.isFormOpen()).toBeTrue();
    expect(component.selectedForEdit()).toEqual(emp);
  });
});
