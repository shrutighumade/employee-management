import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeFormComponent } from './employee-form';
import { ReactiveFormsModule } from '@angular/forms';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create employee form component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form for new employee', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.get('firstName')?.value).toBe('');
  });

  it('should validate email field format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('valid@company.com');
    expect(emailControl?.valid).toBeTrue();
  });
});
