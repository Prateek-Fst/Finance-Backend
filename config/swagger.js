const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API - Complete Documentation",
      version: "1.0.0",
      description: "# Finance Dashboard API\n\nA RESTful API with Role-Based Access Control (RBAC), JWT authentication, and full CRUD on financial records.\n\n## How to use\n1. Register via POST /api/auth/register\n2. Login via POST /api/auth/login — copy token from response\n3. Click Authorize (top right 🔒), paste Bearer <your_token>\n4. All protected endpoints will use your token\n\n## Rate Limiting\nAll /api/* routes: 100 requests per 15 minutes per IP\n\n## RBAC Roles\n| Action | viewer | analyst | admin |\n|--------|--------|---------|-------|\n| Register/Login | ✅ | ✅ | ✅ |\n| View own profile | ✅ | ✅ | ✅ |\n| Read records | ✅ | ✅ | ✅ |\n| Create/Update/Delete records | ❌ | ❌ | ✅ |\n| Dashboard analytics | ❌ | ✅ | ✅ |\n| Manage users | ❌ | ❌ | ✅ |\n\n## Backend URL\nProduction: https://finance-backend-fxvz.onrender.com",
      contact: { name: "API Support", email: "choudharyprateek131@gmail.com" },
    },
    servers: [
      { url: "https://finance-backend-fxvz.onrender.com", description: "Production Server (Render)" },
      { url: "http://localhost:5000", description: "Local Development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Enter JWT token from login" },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6571234567890abcdef12345" },
            name: { type: "string", example: "Admin User" },
            email: { type: "string", example: "admin@example.com" },
            role: { type: "string", enum: ["viewer", "analyst", "admin"], example: "admin" },
            status: { type: "string", enum: ["active", "inactive"], example: "active" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Record: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6571234567890abcdef12345" },
            amount: { type: "number", example: 5000 },
            type: { type: "string", enum: ["income", "expense"], example: "income" },
            category: { type: "string", enum: ["salary", "freelance", "investment", "rent", "food", "transport", "utilities", "entertainment", "healthcare", "education", "shopping", "other"], example: "salary" },
            date: { type: "string", format: "date", example: "2024-01-15" },
            notes: { type: "string", example: "Monthly salary" },
            createdBy: { type: "object", properties: { name: { type: "string" }, email: { type: "string" } } },
            isDeleted: { type: "boolean", example: false },
          },
        },
        Error: { type: "object", properties: { success: { type: "boolean", example: false }, message: { type: "string" } } },
        AuthResponse: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } },
        UsersListResponse: { type: "object", properties: { success: { type: "boolean" }, total: { type: "integer" }, page: { type: "integer" }, pages: { type: "integer" }, users: { type: "array", items: { $ref: "#/components/schemas/User" } } } },
        RecordsListResponse: { type: "object", properties: { success: { type: "boolean" }, total: { type: "integer" }, page: { type: "integer" }, pages: { type: "integer" }, records: { type: "array", items: { $ref: "#/components/schemas/Record" } } } },
        SummaryResponse: { type: "object", properties: { success: { type: "boolean" }, summary: { type: "object", properties: { totalIncome: { type: "number" }, totalExpenses: { type: "number" }, netBalance: { type: "number" }, incomeCount: { type: "integer" }, expenseCount: { type: "integer" }, totalRecords: { type: "integer" } } } } },
        CategoryTotalsResponse: { type: "object", properties: { success: { type: "boolean" }, categoryTotals: { type: "array", items: { type: "object", properties: { category: { type: "string" }, type: { type: "string" }, total: { type: "number" }, count: { type: "integer" } } } } } },
        MonthlyTrendsResponse: { type: "object", properties: { success: { type: "boolean" }, year: { type: "integer" }, monthlyTrends: { type: "array", items: { type: "object", properties: { month: { type: "integer" }, monthName: { type: "string" }, income: { type: "number" }, expense: { type: "number" }, net: { type: "number" } } } } } },
        WeeklyTrendsResponse: { type: "object", properties: { success: { type: "boolean" }, weeklyTrends: { type: "array", items: { type: "object", properties: { _id: { type: "object", properties: { week: { type: "integer" }, year: { type: "integer" }, type: { type: "string" } } }, total: { type: "number" }, count: { type: "integer" } } } } } },
        RecentActivityResponse: { type: "object", properties: { success: { type: "boolean" }, recentActivity: { type: "array", items: { $ref: "#/components/schemas/Record" } } } },
      },
    },
    tags: [
      { name: "1. Health & Info", description: "Public health check and API info endpoints" },
      { name: "2. Authentication", description: "Register, login, get current user. No token needed for register/login" },
      { name: "3. Users (Admin Only)", description: "User CRUD - ADMIN ONLY" },
      { name: "4. Records (RBAC)", description: "Financial records - viewer/analyst: read only, admin: full CRUD" },
      { name: "5. Dashboard (Analyst & Admin)", description: "Analytics - ANALYST & ADMIN ONLY" },
      { name: "6. RBAC Test Scenarios", description: "Complete RBAC testing scenarios" },
      { name: "7. Error Handling Tests", description: "Test error scenarios" },
    ],
    paths: {
      "/": {
        get: {
          tags: ["1. Health & Info"],
          summary: "Health Check",
          description: "Check if API is running",
          responses: {
            200: { description: "Server running", content: { "application/json": { example: { success: true, message: "Finance Dashboard API is running.", version: "1.0.0" } } } },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["2. Authentication"],
          summary: "Register a new user",
          description: "Create new account. Role defaults to viewer. Returns JWT token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string", minLength: 2, maxLength: 50, example: "Admin User" }, email: { type: "string", format: "email", example: "admin@example.com" }, password: { type: "string", minLength: 6, example: "password123" }, role: { type: "string", enum: ["viewer", "analyst", "admin"], example: "admin" } } },
                examples: {
                  admin: { summary: "Register Admin", value: { name: "Admin User", email: "admin@example.com", password: "password123", role: "admin" } },
                  analyst: { summary: "Register Analyst", value: { name: "Analyst User", email: "analyst@example.com", password: "password123", role: "analyst" } },
                  viewer: { summary: "Register Viewer", value: { name: "Viewer User", email: "viewer@example.com", password: "password123", role: "viewer" } },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["2. Authentication"],
          summary: "Login",
          description: "Login with email/password. Returns JWT token for Authorization.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", example: "admin@example.com" }, password: { type: "string", example: "password123" } } },
                examples: {
                  admin: { summary: "Login as Admin", value: { email: "admin@example.com", password: "password123" } },
                  analyst: { summary: "Login as Analyst", value: { email: "analyst@example.com", password: "password123" } },
                  viewer: { summary: "Login as Viewer", value: { email: "viewer@example.com", password: "password123" } },
                  invalid: { summary: "Invalid Credentials (Error)", value: { email: "wrong@example.com", password: "wrongpassword" } },
                  inactive: { summary: "Inactive User (Error)", value: { email: "inactive@example.com", password: "password123" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Invalid email or password." } } } },
            403: { description: "Account inactive", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Account is inactive. Contact admin." } } } },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["2. Authentication"],
          summary: "Get Current User (Me)",
          description: "Get current authenticated user details. Requires valid token.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Current user profile", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } }, example: { success: true, user: { id: "6571234567890abcdef12345", name: "Admin User", email: "admin@example.com", role: "admin", status: "active", createdAt: "2024-01-01T00:00:00.000Z" } } } } },
            401: { description: "No token or invalid token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, examples: { noToken: { value: { success: false, message: "Access denied. No token provided." } }, invalidToken: { value: { success: false, message: "Invalid or expired token." } } } } } },
          },
        },
      },
      "/api/users": {
        get: {
          tags: ["3. Users (Admin Only)"],
          summary: "Get All Users",
          description: "Get all users with pagination and filters. Query: page, limit, status, role. **ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 }, example: 1 },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 }, example: 10 },
            { name: "role", in: "query", schema: { type: "string", enum: ["viewer", "analyst", "admin"] }, example: "admin" },
            { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive"] }, example: "active" },
          ],
          responses: {
            200: { description: "List of users", content: { "application/json": { schema: { $ref: "#/components/schemas/UsersListResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Access denied. Role 'analyst' is not allowed to perform this action." } } } },
          },
        },
      },
      "/api/users/{id}": {
        get: {
          tags: ["3. Users (Admin Only)"],
          summary: "Get User by ID",
          description: "Get specific user by ID. **ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, example: "6571234567890abcdef12345" }],
          responses: {
            200: { description: "User found", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "User not found." } } } },
          },
        },
        put: {
          tags: ["3. Users (Admin Only)"],
          summary: "Update User",
          description: "Update user role/status/name. Cannot update own account. **ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, example: "6571234567890abcdef12346" }],
          requestBody: {
            content: {
              "application/json": {
                schema: { type: "object", properties: { name: { type: "string", example: "New Name" }, role: { type: "string", enum: ["viewer", "analyst", "admin"], example: "analyst" }, status: { type: "string", enum: ["active", "inactive"], example: "inactive" } } },
                examples: { changeRole: { summary: "Change Role to Analyst", value: { role: "analyst" } }, deactivate: { summary: "Deactivate User", value: { status: "inactive" } } },
              },
            },
          },
          responses: {
            200: { description: "User updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
            400: { description: "Cannot update own account or invalid fields", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, examples: { ownAccount: { value: { success: false, message: "You cannot update your own account role." } }, invalidRole: { value: { success: false, message: "Invalid role." } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["3. Users (Admin Only)"],
          summary: "Delete User",
          description: "Delete a user. Cannot delete own account. **ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, example: "6571234567890abcdef12346" }],
          responses: {
            200: { description: "User deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: true, message: "User deleted successfully." } } } },
            400: { description: "Cannot delete own account", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "You cannot delete your own account." } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "User not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/records": {
        get: {
          tags: ["4. Records (RBAC)"],
          summary: "Get All Records",
          description: "Get all records with pagination, filters, sorting. **viewer, analyst, admin** can read.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 }, example: 1 },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 }, example: 10 },
            { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] }, example: "income" },
            { name: "category", in: "query", schema: { type: "string", enum: ["salary", "freelance", "investment", "rent", "food", "transport", "utilities", "entertainment", "healthcare", "education", "shopping", "other"] }, example: "salary" },
            { name: "startDate", in: "query", schema: { type: "string", format: "date" }, example: "2024-01-01" },
            { name: "endDate", in: "query", schema: { type: "string", format: "date" }, example: "2024-12-31" },
            { name: "sortBy", in: "query", schema: { type: "string", default: "date" }, example: "date" },
            { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" }, example: "desc" },
          ],
          responses: {
            200: { description: "List of records", content: { "application/json": { schema: { $ref: "#/components/schemas/RecordsListResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["4. Records (RBAC)"],
          summary: "Create Record (Admin Only)",
          description: "Create income/expense record. **ADMIN ONLY** - others get 403.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object", required: ["amount", "type", "category"], properties: { amount: { type: "number", minimum: 0.01, example: 5000 }, type: { type: "string", enum: ["income", "expense"], example: "income" }, category: { type: "string", enum: ["salary", "freelance", "investment", "rent", "food", "transport", "utilities", "entertainment", "healthcare", "education", "shopping", "other"], example: "salary" }, date: { type: "string", format: "date", example: "2024-01-15" }, notes: { type: "string", maxLength: 500, example: "Monthly salary payment" } } },
                examples: { income: { summary: "Create Income Record", value: { amount: 5000, type: "income", category: "salary", date: "2024-01-15", notes: "Monthly salary payment" } }, expense: { summary: "Create Expense Record", value: { amount: 150.50, type: "expense", category: "food", date: "2024-01-20", notes: "Grocery shopping" } } },
              },
            },
          },
          responses: {
            201: { description: "Record created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, record: { $ref: "#/components/schemas/Record" } } } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Amount must be a positive number. Type must be 'income' or 'expense'." } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Only admin can create records", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Access denied. Role 'analyst' is not allowed to perform this action." } } } },
          },
        },
      },
      "/api/records/{id}": {
        get: {
          tags: ["4. Records (RBAC)"],
          summary: "Get Record by ID",
          description: "Get specific record by ID. **viewer, analyst, admin** can read.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, example: "6571234567890abcdef12345" }],
          responses: {
            200: { description: "Record found", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, record: { $ref: "#/components/schemas/Record" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Record not found." } } } },
          },
        },
        put: {
          tags: ["4. Records (RBAC)"],
          summary: "Update Record (Admin Only)",
          description: "Update a record. **ADMIN ONLY** - others get 403.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, example: "6571234567890abcdef12345" }],
          requestBody: {
            content: {
              "application/json": {
                schema: { type: "object", properties: { amount: { type: "number", minimum: 0.01, example: 5500 }, type: { type: "string", enum: ["income", "expense"] }, category: { type: "string", enum: ["salary", "freelance", "investment", "rent", "food", "transport", "utilities", "entertainment", "healthcare", "education", "shopping", "other"] }, date: { type: "string", format: "date" }, notes: { type: "string", maxLength: 500 } } },
                example: { amount: 5500, type: "income", category: "salary", date: "2024-01-15", notes: "Updated salary with bonus" },
              },
            },
          },
          responses: {
            200: { description: "Record updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, record: { $ref: "#/components/schemas/Record" } } } } } },
            400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Only admin can update records", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["4. Records (RBAC)"],
          summary: "Delete Record (Admin Only - Soft Delete)",
          description: "Soft delete a record (sets isDeleted: true). **ADMIN ONLY** - others get 403.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, example: "6571234567890abcdef12345" }],
          responses: {
            200: { description: "Record soft deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: true, message: "Record deleted (soft delete)." } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Only admin can delete records", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/dashboard/summary": {
        get: {
          tags: ["5. Dashboard (Analyst & Admin)"],
          summary: "Get Summary",
          description: "Get financial summary: total income, expenses, net balance, counts. **ANALYST & ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Summary data", content: { "application/json": { schema: { $ref: "#/components/schemas/SummaryResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Analyst or Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" }, example: { success: false, message: "Access denied. Role 'viewer' is not allowed to perform this action." } } } },
          },
        },
      },
      "/api/dashboard/category-totals": {
        get: {
          tags: ["5. Dashboard (Analyst & Admin)"],
          summary: "Get Category Totals",
          description: "Get totals grouped by category. Query: type (optional). **ANALYST & ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] }, example: "income" }],
          responses: {
            200: { description: "Category totals", content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryTotalsResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Analyst or Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/dashboard/monthly-trends": {
        get: {
          tags: ["5. Dashboard (Analyst & Admin)"],
          summary: "Get Monthly Trends",
          description: "Get monthly trends. Query: year (optional). **ANALYST & ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "year", in: "query", schema: { type: "integer" }, example: 2024 }],
          responses: {
            200: { description: "Monthly trends", content: { "application/json": { schema: { $ref: "#/components/schemas/MonthlyTrendsResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Analyst or Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/dashboard/weekly-trends": {
        get: {
          tags: ["5. Dashboard (Analyst & Admin)"],
          summary: "Get Weekly Trends",
          description: "Get weekly trends for last 8 weeks. **ANALYST & ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Weekly trends", content: { "application/json": { schema: { $ref: "#/components/schemas/WeeklyTrendsResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Analyst or Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/dashboard/recent": {
        get: {
          tags: ["5. Dashboard (Analyst & Admin)"],
          summary: "Get Recent Activity",
          description: "Get recent activity. Query: limit (default: 10). **ANALYST & ADMIN ONLY**",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 10 }, example: 10 }],
          responses: {
            200: { description: "Recent activity", content: { "application/json": { schema: { $ref: "#/components/schemas/RecentActivityResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            403: { description: "Analyst or Admin role required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
