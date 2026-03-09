import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import "./Auth.css";

const ResetPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email || !token || !newPassword) return alert("All fields are required");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    setLoading(true);
    try {
      await resetPassword({ email, token, newPassword });
      alert("Password reset successful! You can now login with your new password.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Reset Password</h1>
        <p>
          Secure your account by choosing a new, strong password. 
          Use the 6-digit token sent to your email to complete the process.
        </p>
      </div>

      <div className="login-right">
        <div className="auth-card">
          <h2 className="auth-title">Reset Password</h2>

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="text"
            placeholder="6-Digit token from email"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button 
            className="auth-btn" 
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="auth-link">
            <span onClick={() => navigate("/login")}>
              Cancel and Back to Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
