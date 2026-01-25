import { useState } from "react";
import "./Auth.css";

const ManagerRegister = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    invite_code: "",
    otp: ""
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {step === 1 ? "Manager Registration" : "OTP Verification"}
        </h2>

        {step === 1 && (
          <>
            <input className="auth-input" placeholder="Name"
              onChange={e => setForm({...form, name:e.target.value})} />
            <input className="auth-input" placeholder="Email"
              onChange={e => setForm({...form, email:e.target.value})} />
            <input className="auth-input" type="password" placeholder="Password"
              onChange={e => setForm({...form, password:e.target.value})} />
            <input className="auth-input" placeholder="Invite Code"
              onChange={e => setForm({...form, invite_code:e.target.value})} />

            <button className="auth-btn" onClick={() => setStep(2)}>
              Verify Invite Code
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input className="auth-input" placeholder="Enter OTP"
              onChange={e => setForm({...form, otp:e.target.value})} />

            <button className="auth-btn">
              Verify & Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerRegister;
