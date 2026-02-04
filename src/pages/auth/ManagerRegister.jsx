import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendManagerOtp,
  verifyOtp,
  registerManager
} from "../../services/authService";
import "./Auth.css";

const ManagerRegister = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    invite_code: "",
    otp: ""
  });

  /* =========================
     STEP 1: SEND OTP
  ========================= */
  const handleSendOtp = async () => {
    if (!form.email || !form.invite_code) {
      alert("Email and Invite Code are required");
      return;
    }

    try {
      await sendManagerOtp(form.email);
      alert("OTP sent to manager email");
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  /* =========================
     STEP 2: VERIFY OTP & REGISTER
  ========================= */
  const handleRegister = async () => {
    if (!form.otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      await verifyOtp(form.email, form.otp);
      await registerManager(form);

      alert("Branch Manager Registered Successfully!");
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {step === 1 ? "Manager Registration" : "OTP Verification"}
        </h2>

        {/* =========================
            STEP 1: DETAILS + OTP SEND
        ========================= */}
        {step === 1 && (
          <>
            <input
              className="auth-input"
              placeholder="Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="auth-input"
              placeholder="Email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <input
              className="auth-input"
              placeholder="Invite Code"
              onChange={(e) =>
                setForm({ ...form, invite_code: e.target.value })
              }
            />

            <button className="auth-btn" onClick={handleSendOtp}>
              Send OTP
            </button>
          </>
        )}

        {/* =========================
            STEP 2: OTP VERIFY
        ========================= */}
        {step === 2 && (
          <>
            <input
              className="auth-input"
              placeholder="Enter OTP"
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />

            <button className="auth-btn" onClick={handleRegister}>
              Verify & Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerRegister;
