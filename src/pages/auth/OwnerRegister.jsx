import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendOwnerOtp,
  verifyOtp,
  registerOwner
} from "../../services/authService";
import "./Auth.css";

const OwnerRegister = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    franchise_name: "",
    location: "",
    contact_email: "",
    description: ""
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {step === 1 && "Owner Registration"}
          {step === 2 && "OTP Verification"}
          {step === 3 && "Franchise Details"}
        </h2>

        {/* STEP 1 */}
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

            <button
              className="auth-btn"
              onClick={async () => {
                try {
                  const res = await sendOwnerOtp(form.email);
                  alert(res.data.message || "OTP sent successfully");
                  setStep(2);
                } catch (err) {
                  alert(
                    err.response?.data?.message ||
                      "Failed to send OTP"
                  );
                }
              }}
            >
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              className="auth-input"
              placeholder="Enter OTP"
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />

            <button
              className="auth-btn"
              onClick={async () => {
                try {
                  const res = await verifyOtp(form.email, form.otp);
                  alert(res.data.message || "OTP verified");
                  setStep(3);
                } catch (err) {
                  alert(
                    err.response?.data?.message ||
                      "Invalid or expired OTP"
                  );
                }
              }}
            >
              Verify OTP
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              className="auth-input"
              placeholder="Franchise Name"
              onChange={(e) =>
                setForm({ ...form, franchise_name: e.target.value })
              }
            />
            <input
              className="auth-input"
              placeholder="Location"
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />
            <input
              className="auth-input"
              placeholder="Contact Email"
              onChange={(e) =>
                setForm({ ...form, contact_email: e.target.value })
              }
            />
            <textarea
              className="auth-input"
              placeholder="Description (optional)"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button
              className="auth-btn"
              onClick={async () => {
                try {
                  const res = await registerOwner(form);
                  alert(
                    res.data.message ||
                      "Franchise created successfully"
                  );
                  navigate("/login");
                } catch (err) {
                  alert(
                    err.response?.data?.message ||
                      "Failed to create franchise"
                  );
                }
              }}
            >
              Create Franchise
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerRegister;
