import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OwnerRegister from "../pages/auth/OwnerRegister";
import ManagerRegister from "../pages/auth/ManagerRegister";

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

    {/* OWNER DASHBOARD */}
    <Route path="/owner-dashboard" element={<DashboardLayout />}>
      <Route index element={<OwnerDashboard />} />
    </Route>

    {/* MANAGER DASHBOARD + MODULES */}
    <Route path="/manager-dashboard" element={<DashboardLayout />}>
      <Route index element={<ManagerDashboard />} />
      <Route path="sales" element={<Sales />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="employees" element={<Employee />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="notifications" element={<Notifications />} />
    </Route>
  </Routes>
);

export default AppRoutes;
