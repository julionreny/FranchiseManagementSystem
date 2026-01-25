import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OwnerRegister from "../pages/auth/OwnerRegister";
import ManagerRegister from "../pages/auth/ManagerRegister";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/register/owner" element={<OwnerRegister />} />
    <Route path="/register/manager" element={<ManagerRegister />} />
  </Routes>
);

export default AppRoutes;
