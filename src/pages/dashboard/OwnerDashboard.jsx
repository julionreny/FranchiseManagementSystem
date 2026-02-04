import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { createBranch } from "../../services/branchService";
import { getOwnerFranchise } from "../../services/franchiseService";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [franchise, setFranchise] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [location, setLocation] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  /* =========================
     AUTH + FETCH FRANCHISE
     ========================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role_id !== 1) {
      alert("Unauthorized access");
      navigate("/login");
      return;
    }

    // fetch owner's franchise
    getOwnerFranchise(user.user_id)
      .then((res) => {
        setFranchise(res.data);
      })
      .catch(() => {
        alert("Failed to load franchise details");
      });
  }, [navigate]);

  /* =========================
     CREATE BRANCH
     ========================= */
  const handleCreateBranch = async () => {
    if (!branchName || !location) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await createBranch({
        franchise_id: franchise.franchise_id,
        branch_name: branchName,
        location
      });

      setInviteCode(res.data.invite_code);
      alert("Branch created successfully!");

      setShowForm(false);
      setBranchName("");
      setLocation("");
    } catch (err) {
      alert("Failed to create branch");
    }
  };

  /* =========================
     LOADING STATE
     ========================= */
  if (!franchise) {
    return (
      <DashboardLayout>
        <h3>Loading franchise details...</h3>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1>Owner Dashboard</h1>

      {/* STATS */}
      <div className="stats-grid">
        <StatCard title="Franchise Name" value={franchise.franchise_name} />
        <StatCard title="Location" value={franchise.location} />
        <StatCard title="Total Branches" value="-" />
        <StatCard title="Employees" value="-" />
      </div>

      {/* ADD BRANCH */}
      <div style={{ marginTop: "30px" }}>
        <button className="auth-btn" onClick={() => setShowForm(!showForm)}>
          ➕ Add New Branch
        </button>
      </div>

      {/* CREATE BRANCH FORM */}
      {showForm && (
        <div className="auth-card" style={{ marginTop: "20px" }}>
          <h3>Create Branch</h3>

          <input
            className="auth-input"
            placeholder="Branch Name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <button className="auth-btn" onClick={handleCreateBranch}>
            Create Branch
          </button>
        </div>
      )}

      {/* INVITE CODE */}
      {inviteCode && (
        <div className="success-msg" style={{ marginTop: "20px" }}>
          <strong>Branch Manager Invite Code:</strong>
          <p style={{ fontSize: "18px", letterSpacing: "1px" }}>
            {inviteCode}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerDashboard;
