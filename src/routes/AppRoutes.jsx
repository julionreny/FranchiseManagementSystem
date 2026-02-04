import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OwnerRegister from "../pages/auth/OwnerRegister";
import ManagerRegister from "../pages/auth/ManagerRegister";
import OwnerDashboard from "../pages/dashboard/OwnerDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import Sales from "../pages/sales/Sales";
import Inventory from "../pages/inventory/Inventory";
import Employee from "../pages/employees/Employee";
import Expenses from "../pages/expenses/Expenses";
import Notifications from "../pages/notifications/Notifications";
const AppRoutes = () => (
  <Routes>
   
     <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register/owner" element={<OwnerRegister />} />
    <Route path="/register/manager" element={<ManagerRegister />} />
    <Route path="/owner-dashboard" element={<OwnerDashboard />} />
    <Route path="/sales" element={<Sales />} />
    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/employees" element={<Employee />} />
    <Route path="/expenses" element={<Expenses />} />
    <Route path="/notifications" element={<Notifications/>} />
    
  </Routes>
);

export default AppRoutes;
