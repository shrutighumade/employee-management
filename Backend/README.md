# Employee Management Project Backend

## Tech Stack :

- Dotnet 9.0.304
- Entity Framework Core 9.0.4
- postgres (PostgreSQL) 18.4

                    USER SYSTEM
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    Registration       Login        Forgot Password
        │                │                │
   Create User       Verify User      Send Token
        │                │                │
   Hash Password     Generate JWT      Reset Link
        │                │
        └───────────────┼────────────────
                        │
                  User Dashboard
                        │
              ┌─────────┴─────────┐
              │                   │
          User Profile       Change Password


          Admin
  │
  ├── Manage Users
  ├── Add Employee
  ├── Edit Employee
  ├── Delete Employee
  └── Employee List


