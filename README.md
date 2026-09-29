# Employee Management System

A full-stack, enterprise-grade Employee Management Application built with **Angular (v20+) Signals**, **ASP.NET Core .NET 9 Web API**, **Entity Framework Core**, and **Font Awesome 6**.

---

## 🌟 Key Features

- **Single-Page Employee Dashboard**: Real-time KPI metrics cards for Total Employees, Monthly Payroll, Average Salary, and Leaves Balance.
- **5-Item Grid Pagination**: Clean grid view displaying a maximum of 5 records per page with server-side pagination controls.
- **Server-Side Search & Filter**: Instant search filtering by Name, Employee ID, Phone Number, or Joining Date.
- **Offcanvas Drawer Form**: Slide-over panel for creating and editing records with sticky footer buttons.
- **Delete Modal Dialog**: Custom modal prompt for safe record deletion.
- **Sticky Top Navbar**: Brand badge, active tab indicators (`routerLinkActive`), user profile badge, and mobile drawer.
- **Redesigned 404 Page**: Modern error view with browser back navigation and home redirect.
- **Unit Test Coverage**: Comprehensive xUnit tests for the C# backend and Vitest unit tests for Angular services/components.

---

## 🚀 How to Run the Application & Tests

### 1. Run Backend Web API (.NET 9)
```bash
cd Backend/EmployeeManagement.API
dotnet run
```
- **API URL**: `http://localhost:5261/api`
- **Swagger Documentation**: `http://localhost:5261/swagger`

### 2. Run Backend Unit Tests (xUnit)
```bash
dotnet test Backend/EmployeeManagement.Tests/EmployeeManagement.Tests.csproj
```
*(Runs 7/7 passing unit tests covering CRUD, pagination, and search filtering)*

### 3. Run Frontend UI (Angular v20+)
```bash
cd Frontend/employee-management-ui
npm start
```
- **Application URL**: `http://localhost:4200/employee`

### 4. Run Frontend Unit Tests (Vitest)
```bash
cd Frontend/employee-management-ui
npx vitest run
```

---

## 📚 Project Structure

```text
employee-management/
├── Backend/
│   ├── EmployeeManagement.API/      # .NET 9 Web API Controllers, Models, Data
│   └── EmployeeManagement.Tests/    # xUnit Unit Test Suite
├── Frontend/
│   └── employee-management-ui/      # Angular v20+ UI Components & Services
└── README.md                        # Root Project Guide
```
