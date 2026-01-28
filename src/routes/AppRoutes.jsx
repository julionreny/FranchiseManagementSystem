import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OwnerRegister from "../pages/auth/OwnerRegister";
import ManagerRegister from "../pages/auth/ManagerRegister";
import OwnerDashboard from "../pages/dashboard/OwnerDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import Sales from "../pages/sales/Sales";
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register/owner" element={<OwnerRegister />} />
    <Route path="/register/manager" element={<ManagerRegister />} />
    <Route path="/owner-dashboard" element={<OwnerDashboard />} />
    <Route path="/sales" element={<Sales />} />
    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
  </Routes>
);

export default AppRoutes;
