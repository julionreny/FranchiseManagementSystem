import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Register As</h2>

        <div className="role-container">
          <div
            className="role-card"
            onClick={() => navigate("/register/owner")}
          >
            <h3>Franchise Owner</h3>
            <p>Create and manage franchises</p>
          </div>

          <div
            className="role-card"
            onClick={() => navigate("/register/manager")}
          >
            <h3>Branch Manager</h3>
            <p>Manage assigned branch</p>
          </div>
        </div>

        <div className="auth-link">
          <span onClick={() => navigate("/")}>
            Already have an account? Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
