export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  dateOfJoining: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  dateOfJoining: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface UpdateEmployeePayload extends CreateEmployeePayload { }

export interface EmployeeFilterParams {
  search?: string;
  department?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DepartmentStat {
  name: string;
  employeeCount: number;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  averageSalary: number;
  departmentCount: number;
  departments: DepartmentStat[];
}
