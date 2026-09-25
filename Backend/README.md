# Employee Management System - Backend & Testing Guide

## Technology Stack
- **Framework**: .NET 9.0 (ASP.NET Core Web API)
- **ORM**: Entity Framework Core 9.0.4 (PostgreSQL & SQLite Resilience)
- **Database**: PostgreSQL 18.4 (Default) / SQLite (`EmployeeManagement.db` Fallback)
- **Testing**: xUnit, Microsoft.EntityFrameworkCore.InMemory
- **API Docs**: Swagger UI OpenAPI v6

---

## System Architecture Overview

```text
                  USER / ADMIN SYSTEM
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    Registration       Login        Forgot Password
        │                │                │
   Create User       Verify User      Send Reset Token
        │                │                │
   Hash Password     Generate JWT      Reset Link
        │                │
        └───────────────┼────────────────
                        │
                Employee Hub Dashboard
                        │
       ┌────────────────┴────────────────┐
       │                                 │
 Employee Management API        User Profile / Security
       │
 ├── GET /api/Employees (Paginated, Max 5/Page)
 ├── POST /api/Employees (Create Record)
 ├── PUT /api/Employees/{id} (Update Record)
 └── DELETE /api/Employees/{id} (Remove Record)
```

---

## How to Run the Backend API

### 1. Start the API Server
Run the following commands from the project root:

```bash
cd Backend/EmployeeManagement.API
dotnet run
```

- **HTTP API Endpoint**: `http://localhost:5261/api`
- **Swagger Documentation**: Open `http://localhost:5261/swagger` in your browser.

---

## How to Run Unit Tests

### 1. Backend Unit Tests (xUnit)
To execute all backend controller and database service tests:

```bash
# From workspace root directory
dotnet test Backend/EmployeeManagement.Tests/EmployeeManagement.Tests.csproj
```

Or run without rebuilding dependencies:
```bash
dotnet test Backend/EmployeeManagement.Tests/EmployeeManagement.Tests.csproj --no-build
```

**Test Coverage Includes**:
- `GetEmployees_ReturnsPaginatedList_WithCorrectItemsAndMetadata` (5 items max per page)
- `GetEmployees_WithSearch_FiltersResults`
- `GetEmployee_ReturnsEmployee_WhenIdExists`
- `GetEmployee_ReturnsNotFound_WhenIdDoesNotExist`
- `CreateEmployee_AddsEmployeeToDatabase_AndReturnsCreatedResult`
- `UpdateEmployee_ModifiesEmployeeRecord_WhenIdExists`
- `DeleteEmployee_RemovesEmployee_WhenIdExists`

---

## How to Run the Frontend Application & Tests

### 1. Run Angular Frontend Application
```bash
cd Frontend/employee-management-ui
npm start
```
Access the application UI in browser at: `http://localhost:4200/employee`

### 2. Run Frontend Unit Tests (Vitest)
```bash
cd Frontend/employee-management-ui
npx vitest run
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Employees?page=1&pageSize=5` | Get paginated employee records (Max 5/page) |
| `GET` | `/api/Employees?search=keyword` | Filter employees by Name, ID, or Phone |
| `GET` | `/api/Employees/{id}` | Get single employee details by ID |
| `POST` | `/api/Employees` | Create new employee record |
| `PUT` | `/api/Employees/{id}` | Update existing employee record |
| `DELETE` | `/api/Employees/{id}` | Delete employee record |
