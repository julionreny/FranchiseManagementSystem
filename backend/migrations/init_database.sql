-- Complete Database Schema Setup for Franchise Management System

-- 1. Create OTP Verification Table if it doesn't exist
CREATE TABLE IF NOT EXISTS otp_verification (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expiry_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles if they don't exist
INSERT INTO roles (role_name) VALUES ('FRANCHISE_OWNER') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('BRANCH_MANAGER') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('EMPLOYEE') ON CONFLICT DO NOTHING;

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(role_id),
  branch_id INTEGER,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Franchises Table
CREATE TABLE IF NOT EXISTS franchises (
  franchise_id SERIAL PRIMARY KEY,
  franchise_name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(user_id),
  location VARCHAR(255),
  contact_email VARCHAR(255),
  description TEXT,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 5. Create Branches Table with Manager Invite Columns
CREATE TABLE IF NOT EXISTS branches (
  branch_id SERIAL PRIMARY KEY,
  franchise_id INTEGER NOT NULL REFERENCES franchises(franchise_id),
  branch_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  manager_id INTEGER REFERENCES users(user_id),
  manager_email VARCHAR(255),
  manager_invite_code VARCHAR(10) UNIQUE,
  is_code_used BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
  employee_id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  age INTEGER,
  designation VARCHAR(100),
  address TEXT,
  mobile_no VARCHAR(20),
  experience INTEGER,
  salary DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Sales Table
CREATE TABLE IF NOT EXISTS sales (
  sale_id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
  receipt_no VARCHAR(100) UNIQUE,
  product_name VARCHAR(255),
  customer_name VARCHAR(255),
  contact VARCHAR(20),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  sale_date DATE NOT NULL,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  expense_id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
  expense_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  reorder_level DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(branch_id),
  role_id INTEGER REFERENCES roles(role_id),
  message TEXT NOT NULL,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_branches_franchise_id ON branches(franchise_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_expenses_branch_id ON expenses(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_branch_id ON inventory(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_branch_id ON notifications(branch_id);
