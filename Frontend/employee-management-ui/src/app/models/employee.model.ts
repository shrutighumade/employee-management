export interface IEmployee {
  id?: number;
  name: string;
  employeId: number;
  employeSalary: number;
  leavesCount: number;
  joingDate: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
