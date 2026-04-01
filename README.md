# Finance Dashboard Backend

A RESTful API for a personal finance dashboard with Role-Based Access Control (RBAC), JWT authentication, and full CRUD operations on financial records.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express v5
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Rate Limiting:** express-rate-limit
- **Config:** dotenv

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file in the root (see `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed the database (optional)
```bash
npm run seed
```

### 4. Start the server
```bash
# Production
npm start

# Development (with nodemon auto-restart)
npm run dev
```

Server runs at `http://localhost:5000`

---

## Roles & Permissions (RBAC)

| Action                        | viewer | analyst | admin |
|-------------------------------|--------|---------|-------|
| Register / Login              | ✅     | ✅      | ✅    |
| View own profile (`/me`)      | ✅     | ✅      | ✅    |
| Read records                  | ✅     | ✅      | ✅    |
| Create / Update / Delete records | ❌  | ❌      | ✅    |
| Access dashboard analytics    | ❌     | ✅      | ✅    |
| Manage users                  | ❌     | ❌      | ✅    |

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned on register and login. They expire based on `JWT_EXPIRES_IN` (default: `7d`).

---

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/`      | None | Server health check |

**Response:**
```json
{
  "success": true,
  "message": "Finance Dashboard API is running.",
  "version": "1.0.0"
}
```

---

### Auth — `/api/auth`

#### POST `/api/auth/register`
Register a new user.

- **Auth:** None
- **Body:**
```json
{
  "name": "Prateek",
  "email": "prateek@example.com",
  "password": "secret123",
  "role": "viewer"
}
```
- `role` is optional — defaults to `viewer`. Accepted values: `viewer`, `analyst`, `admin`
- `name`: min 2, max 50 characters
- `password`: min 6 characters

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "Prateek",
    "email": "prateek@example.com",
    "role": "viewer",
    "status": "active"
  }
}
```

---

#### POST `/api/auth/login`
Login with email and password.

- **Auth:** None
- **Body:**
```json
{
  "email": "prateek@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "<jwt_token>",
  "user": {
    "id": "...",
    "name": "Prateek",
    "email": "prateek@example.com",
    "role": "viewer",
    "status": "active"
  }
}
```

> Returns `401` for invalid credentials, `403` if account is inactive.

---

#### GET `/api/auth/me`
Get the currently authenticated user's profile.

- **Auth:** Required (any role)

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Prateek",
    "email": "prateek@example.com",
    "role": "viewer",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Users — `/api/users`

> All routes require `admin` role.

#### GET `/api/users`
Get all users with optional filters and pagination.

- **Auth:** Admin only
- **Query Params:**

| Param  | Type   | Description                        |
|--------|--------|------------------------------------|
| status | string | Filter by `active` or `inactive`   |
| role   | string | Filter by `viewer`, `analyst`, `admin` |
| page   | number | Page number (default: `1`)         |
| limit  | number | Results per page (default: `10`)   |

**Response `200`:**
```json
{
  "success": true,
  "total": 25,
  "page": 1,
  "pages": 3,
  "users": [ { "id": "...", "name": "...", "email": "...", "role": "...", "status": "..." } ]
}
```

---

#### GET `/api/users/:id`
Get a single user by ID.

- **Auth:** Admin only

**Response `200`:**
```json
{
  "success": true,
  "user": { "id": "...", "name": "...", "email": "...", "role": "...", "status": "..." }
}
```

---

#### PUT `/api/users/:id`
Update a user's `name`, `role`, or `status`.

- **Auth:** Admin only
- **Body (all fields optional):**
```json
{
  "name": "New Name",
  "role": "analyst",
  "status": "inactive"
}
```
- `role` must be one of: `viewer`, `analyst`, `admin`
- `status` must be one of: `active`, `inactive`

**Response `200`:**
```json
{
  "success": true,
  "message": "User updated.",
  "user": { ... }
}
```

---

#### DELETE `/api/users/:id`
Delete a user permanently.

- **Auth:** Admin only
- Admin cannot delete their own account.

**Response `200`:**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

### Records — `/api/records`

Financial transaction records (income/expense).

#### GET `/api/records`
Get all records with filters, sorting, and pagination.

- **Auth:** `viewer`, `analyst`, `admin`
- **Query Params:**

| Param     | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| type      | string | Filter by `income` or `expense`                  |
| category  | string | Filter by category (see categories below)        |
| startDate | date   | Filter records on or after this date (ISO 8601)  |
| endDate   | date   | Filter records on or before this date (ISO 8601) |
| page      | number | Page number (default: `1`)                       |
| limit     | number | Results per page (default: `10`)                 |
| sortBy    | string | Field to sort by (default: `date`)               |
| order     | string | `asc` or `desc` (default: `desc`)                |

**Response `200`:**
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "pages": 10,
  "records": [
    {
      "_id": "...",
      "amount": 5000,
      "type": "income",
      "category": "salary",
      "date": "2024-06-01T00:00:00.000Z",
      "notes": "June salary",
      "createdBy": { "name": "Prateek", "email": "prateek@example.com" }
    }
  ]
}
```

---

#### GET `/api/records/:id`
Get a single record by ID.

- **Auth:** `viewer`, `analyst`, `admin`

**Response `200`:**
```json
{
  "success": true,
  "record": { ... }
}
```

---

#### POST `/api/records`
Create a new financial record.

- **Auth:** Admin only
- **Body:**
```json
{
  "amount": 1500.00,
  "type": "expense",
  "category": "food",
  "date": "2024-06-15",
  "notes": "Grocery shopping"
}
```
- `amount`: required, must be > 0
- `type`: required — `income` or `expense`
- `category`: required — see valid categories below
- `date`: optional, defaults to current date
- `notes`: optional, max 500 characters

**Response `201`:**
```json
{
  "success": true,
  "message": "Record created successfully.",
  "record": { ... }
}
```

---

#### PUT `/api/records/:id`
Update an existing record.

- **Auth:** Admin only
- **Body:** Same fields as POST (all optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Record updated.",
  "record": { ... }
}
```

---

#### DELETE `/api/records/:id`
Soft-delete a record (sets `isDeleted: true`, data is preserved in DB).

- **Auth:** Admin only

**Response `200`:**
```json
{
  "success": true,
  "message": "Record deleted (soft delete)."
}
```

---

### Dashboard — `/api/dashboard`

> All routes require `analyst` or `admin` role.

#### GET `/api/dashboard/summary`
Overall financial summary — total income, expenses, and net balance.

- **Auth:** `analyst`, `admin`

**Response `200`:**
```json
{
  "success": true,
  "summary": {
    "totalIncome": 50000,
    "totalExpenses": 32000,
    "netBalance": 18000,
    "incomeCount": 10,
    "expenseCount": 25,
    "totalRecords": 35
  }
}
```

---

#### GET `/api/dashboard/category-totals`
Total amount and count grouped by category and type.

- **Auth:** `analyst`, `admin`
- **Query Params:**

| Param | Type   | Description                              |
|-------|--------|------------------------------------------|
| type  | string | Optional — filter by `income` or `expense` |

**Response `200`:**
```json
{
  "success": true,
  "categoryTotals": [
    { "category": "salary", "type": "income", "total": 40000, "count": 8 },
    { "category": "food", "type": "expense", "total": 8000, "count": 12 }
  ]
}
```

---

#### GET `/api/dashboard/monthly-trends`
Monthly income vs expense breakdown for a given year.

- **Auth:** `analyst`, `admin`
- **Query Params:**

| Param | Type   | Description                          |
|-------|--------|--------------------------------------|
| year  | number | Year to fetch (default: current year) |

**Response `200`:**
```json
{
  "success": true,
  "year": 2024,
  "monthlyTrends": [
    { "month": 1, "monthName": "January", "income": 5000, "expense": 3000, "net": 2000 },
    { "month": 2, "monthName": "February", "income": 4500, "expense": 2800, "net": 1700 }
  ]
}
```

---

#### GET `/api/dashboard/weekly-trends`
Weekly income vs expense for the last 8 weeks (56 days).

- **Auth:** `analyst`, `admin`

**Response `200`:**
```json
{
  "success": true,
  "weeklyTrends": [
    { "_id": { "week": 22, "year": 2024, "type": "income" }, "total": 1200, "count": 2 },
    { "_id": { "week": 22, "year": 2024, "type": "expense" }, "total": 800, "count": 5 }
  ]
}
```

---

#### GET `/api/dashboard/recent`
Most recent financial activity.

- **Auth:** `analyst`, `admin`
- **Query Params:**

| Param | Type   | Description                        |
|-------|--------|------------------------------------|
| limit | number | Number of records to return (default: `10`) |

**Response `200`:**
```json
{
  "success": true,
  "recentActivity": [ { ... }, { ... } ]
}
```

---

## Valid Record Categories

| Category      | Type              |
|---------------|-------------------|
| salary        | income            |
| freelance     | income            |
| investment    | income            |
| rent          | expense           |
| food          | expense           |
| transport     | expense           |
| utilities     | expense           |
| entertainment | expense           |
| healthcare    | expense           |
| education     | expense           |
| shopping      | expense           |
| other         | income / expense  |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Description of the error."
}
```

| Status | Meaning                                      |
|--------|----------------------------------------------|
| 400    | Bad request / validation failed              |
| 401    | Missing or invalid/expired JWT token         |
| 403    | Authenticated but insufficient role / inactive account |
| 404    | Resource not found                           |
| 429    | Rate limit exceeded (100 req / 15 min per IP)|
| 500    | Internal server error                        |

---

## Rate Limiting

All `/api/*` routes are limited to **100 requests per 15 minutes** per IP address.

---

## Project Structure

```
finance-backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # Register, login, getMe
│   ├── userController.js   # User CRUD (admin)
│   ├── recordController.js # Financial record CRUD
│   └── dashboardController.js # Analytics & trends
├── middleware/
│   ├── auth.js             # JWT protect + role authorize
│   ├── errorHandler.js     # Central error handler
│   └── validate.js         # Request body validators
├── models/
│   ├── User.js             # User schema (name, email, password, role, status)
│   └── Record.js           # Record schema (amount, type, category, date, notes)
├── routes/
│   ├── auth.js             # /api/auth
│   ├── users.js            # /api/users
│   ├── records.js          # /api/records
│   └── dashboard.js        # /api/dashboard
├── utils/
│   └── seed.js             # Database seeder
├── .env.example
├── package.json
└── server.js               # App entry point
```
