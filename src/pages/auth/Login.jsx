import { Link } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import "./Auth.css";

export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Multi-Branch Franchise System</h1>
        <p>Centralized management for all franchise operations</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Login</h2>

          <Input type="email" placeholder="Email ID" />
          <Input type="password" placeholder="Password" />

          <Button text="Login" />

          <p className="auth-link">Forgot Password?</p>

          <div className="divider">OR</div>

          <Link to="/register" className="auth-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
