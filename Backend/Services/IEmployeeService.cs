using Backend.DTOs;

namespace Backend.Services;

public interface IEmployeeService
{
    Task<PagedResult<EmployeeDto>> GetEmployeesAsync(EmployeeQueryParams queryParams);
    Task<EmployeeDto?> GetEmployeeByIdAsync(int id);
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto);
    Task<EmployeeDto?> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);
    Task<bool> DeleteEmployeeAsync(int id);
    Task<IEnumerable<string>> GetDepartmentsAsync();
    Task<EmployeeStatsDto> GetStatsAsync();
}
