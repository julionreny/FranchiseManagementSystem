# Branch Manager Registration Fix - Setup Guide

## Problem
When a franchise owner creates a branch and a branch manager tries to register using the invite code, you get a **500 Internal Server Error** with the message "Manager registration failed".

## Root Cause
The `branches` table in the PostgreSQL database is missing the required columns:
- `manager_invite_code` - Stores the unique invite code
- `is_code_used` - Tracks whether the invite code has been used
- `manager_id` - Foreign key to the users table

## Solution Steps

### Step 1: Run Database Migration
1. Open a terminal in the `backend` directory:
   ```powershell
   cd backend
   ```

2. Run the migration script:
   ```powershell
   npm run migrate
   ```

   **Output should show**: ✅ Database migration completed successfully!

### Step 2: Verify Database Tables (Optional)
Connect to your PostgreSQL database using pgAdmin or psql and run:
```sql
\d branches
```

You should see these columns:
- branch_id
- franchise_id
- branch_name
- location
- manager_id
- **manager_invite_code** (newly added)
- **is_code_used** (newly added)
- status
- created_at

### Step 3: Restart Backend Server
1. Kill the current backend process
2. Restart the backend:
   ```powershell
   npm start
   ```

### Step 4: Test the Registration Flow

1. **Franchise Owner creates a branch:**
   - Login as franchise owner
   - Go to Owner Dashboard
   - Click "Add New Branch"
   - Fill in branch name and location
   - Copy the generated invite code

2. **Branch Manager registers:**
   - Go to Registration page
   - Select "Branch Manager"
   - Enter name, email, password
   - Paste the invite code
   - Click "Send OTP"
   - Enter the OTP
   - Click "Verify & Register"

### Step 5: Verify successful registration
After successful registration, the manager should be able to login and see:
- `/manager-dashboard` with access to Sales, Inventory, Employees, Expenses, Notifications

## What Was Changed

### Database Schema
Added three columns to the `branches` table:
```sql
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS manager_invite_code VARCHAR(10) UNIQUE,
ADD COLUMN IF NOT EXISTS is_code_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(user_id);
```

### Backend Package.json
Added a migration script:
```json
"migrate": "node migrate.js"
```

## Troubleshooting

### Still getting 500 error?
1. Check backend console logs for the exact error
2. Verify the invite code is correct (case-sensitive)
3. Ensure the code hasn't been used already
4. Check PostgreSQL is running

### Migration fails?
- Make sure PostgreSQL database `miniproject` exists
- Check database credentials in `backend/config/db.js`
- Run migration script with: `npm run migrate`

### Still not working?
Try running the SQL directly in pgAdmin:
1. Open SQL editor in pgAdmin
2. Copy the contents of `backend/migrations/init_database.sql`
3. Execute the SQL
4. Restart the backend server
