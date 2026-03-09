import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async () => {
    if (!email) return alert("Please enter your email");
    setLoading(true);
    try {
      await forgotPassword(email);
      alert("Reset token sent to your email!");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Forgot Password</h1>
        <p>
          Don't worry! Enter your registered email address and we will send you a 
          6-digit reset token to regain access to your account.
        </p>
      </div>

      <div className="login-right">
        <div className="auth-card">
          <h2 className="auth-title">Forgot Password</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
            Enter your email to receive a reset token.
          </p>

          <input
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button 
            className="auth-btn" 
            onClick={handleRequest}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Token"}
          </button>

          <div className="auth-link">
            <span onClick={() => navigate("/login")}>
              Back to Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
