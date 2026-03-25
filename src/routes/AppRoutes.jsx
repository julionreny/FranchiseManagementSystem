import { Routes, Route, Navigate } from "react-router-dom";

import OwnerExpense from "../pages/owner/OwnerExpense";
import OwnerInventory from "../pages/owner/OwnerInventory";
import OwnerSales from "../pages/owner/OwnerSales";
import BranchPerformance from "../pages/owner/BranchPerformance";
import SystemAnalytics from "../pages/owner/SystemAnalytics";
import HQReports from "../pages/owner/HQReports";
import BranchManagement from "../pages/owner/BranchManagement";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OwnerRegister from "../pages/auth/OwnerRegister";
import ManagerRegister from "../pages/auth/ManagerRegister";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import OwnerDashboard from "../pages/dashboard/OwnerDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import DashboardLayout from "../pages/dashboard/DashboardLayout";

import Sales from "../pages/sales/Sales";
import Inventory from "../pages/inventory/Inventory";
import Employee from "../pages/employees/Employee";
import Expenses from "../pages/expenses/Expenses";
import Notifications from "../pages/notifications/Notifications";

const AppRoutes = () => (
  <Routes>
    {/* AUTH ROUTES */}
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/register/owner" element={<OwnerRegister />} />
    <Route path="/register/manager" element={<ManagerRegister />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />


    {/* OWNER DASHBOARD */}
    <Route path="/owner-dashboard" element={<DashboardLayout />}>
      <Route index element={<OwnerDashboard />} />
      <Route path="sales" element={<OwnerSales />} />
      <Route path="inventory" element={<OwnerInventory />} />
      <Route path="employees" element={<Employee />} />
      <Route path="expenses" element={<OwnerExpense />} />
      <Route path="notifications" element={<Notifications />} />
      {/* Owner add-on routes */}
      <Route path="performance" element={<BranchPerformance />} />
      <Route path="analytics" element={<SystemAnalytics />} />
      <Route path="reports" element={<HQReports />} />
      <Route path="branches" element={<BranchManagement />} />
    </Route>

    {/* MANAGER DASHBOARD + MODULES */}
    <Route path="/manager-dashboard" element={<DashboardLayout />}>

  {/* dashboard page */}
  <Route index element={<ManagerDashboard />} />

  <Route path="dashboard" element={<ManagerDashboard />} />

  {/* modules */}
  <Route path="sales" element={<Sales />} />

    <Route path="inventory" element={<Inventory />} />

    <Route path="employees" element={<Employee />} />

    <Route path="expenses" element={<Expenses />} />

    <Route path="notifications" element={<Notifications />} />

  </Route>
  </Routes>
);

export default AppRoutes;
