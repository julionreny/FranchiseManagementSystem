import { Link } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import "./Auth.css";

export default function Register() {
  return (
    <div className="auth-container">
      <div className="auth-right full">
        <div className="auth-card">
          
          {/* Back Button */}
          <Link to="/" className="back-link">← Back to Login</Link>

          <h2 className="auth-title">Create Account</h2>

          <Input type="text" placeholder="Full Name" />
          <Input type="email" placeholder="Email ID" />
          <Input type="password" placeholder="Password" />

          <div className="role-select">
            <label>
              <input type="radio" name="role" /> Branch Manager
            </label>
            <label>
              <input type="radio" name="role" /> Franchise Owner
            </label>
          </div>

          <Button text="Continue" />
        </div>
      </div>
    </div>
  );
}
