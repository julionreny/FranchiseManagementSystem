import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await loginUser({ email, password });

localStorage.setItem("user", JSON.stringify(res.data.user));

console.log("Navigating to owner dashboard");

if (res.data.user.role_id === 1) {
  navigate("/owner-dashboard", { replace: true });
} else if (res.data.user.role_id === 2) {
  navigate("/manager-dashboard", { replace: true });
}


  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Invalid email or password"
    );
  }
};


  return (
    <div className="login-page">
      
      <div className="login-left">
        <h1>Franchise Management System</h1>
        <p>
          A centralized platform to manage franchises, branches, employees,
          sales, inventory, and notifications efficiently.
        </p>
        <ul>
          <li>✔ Secure role-based access</li>
          <li>✔ OTP-based authentication</li>
          <li>✔ Real-time operational insights</li>
        </ul>
      </div>

     
      <div className="login-right">
        <div className="auth-card">
          <h2 className="auth-title">Login</h2>

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-btn" onClick={handleLogin}>
            Login
          </button>

          <div className="auth-link">
            <span onClick={() => navigate("/register")}>
              New user? Register
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
