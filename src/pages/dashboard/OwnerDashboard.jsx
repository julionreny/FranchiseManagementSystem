import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/dashboard/StatCard";
import { createBranch, getBranchesByFranchise } from "../../services/branchService";
import { getOwnerFranchise } from "../../services/franchiseService";
import "./Dashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [franchise, setFranchise] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [location, setLocation] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  /* =========================
     FETCH BRANCHES
     ========================= */
  const fetchBranches = async (franchiseId) => {
    try {
      console.log("📍 Fetching branches for franchise:", franchiseId);
      const res = await getBranchesByFranchise(franchiseId);
      console.log("✅ Branches fetched:", res.data);
      setBranches(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch branches:", err);
      setBranches([]);
    }
  };

  /* =========================
     AUTH + FETCH FRANCHISE + BRANCHES
     ========================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    console.log("👤 User logged in:", user);

    if (user.role_id !== 1) {
      alert("Unauthorized access");
      navigate("/login");
      return;
    }

    // If we have franchise_id from login, use it directly
    if (user.franchise_id) {
      console.log("✅ franchise_id from login:", user.franchise_id);
      // Fetch franchise details and branches
      getOwnerFranchise(user.user_id)
        .then((res) => {
          console.log("✅ Franchise details:", res.data);
          setFranchise(res.data);
          fetchBranches(user.franchise_id);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch franchise:", err);
          alert("Failed to load franchise details");
        });
    } else {
      console.log("⚠️  No franchise_id from login, fetching franchise...");
      // Fallback: fetch franchise to get franchise_id
      getOwnerFranchise(user.user_id)
        .then((res) => {
          console.log("✅ Franchise details (fallback):", res.data);
          setFranchise(res.data);
          fetchBranches(res.data.franchise_id);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch franchise (fallback):", err);
          alert("Failed to load franchise details");
        });
    }
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

      console.log("✅ Branch created:", res.data);
      setInviteCode(res.data.invite_code);
      alert("Branch created successfully!");

      // Reset form
      setShowForm(false);
      setBranchName("");
      setLocation("");

      // Refresh branches list after a short delay
      setTimeout(() => {
        fetchBranches(franchise.franchise_id);
      }, 500);
    } catch (err) {
      console.error("❌ Failed to create branch:", err);
      alert("Failed to create branch");
    }
  };

  /* =========================
     LOADING STATE
     ========================= */
  if (!franchise) {
    return <h3>Loading franchise details...</h3>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Owner Dashboard</h1>

      {/* STATS */}
      <div className="stats-grid">
        <StatCard title="Franchise Name" value={franchise.franchise_name} />
        <StatCard title="Location" value={franchise.location} />
        <StatCard title="Total Branches" value={branches.length} />
        <StatCard title="Status" value={franchise.status || "ACTIVE"} />
      </div>

      {/* ADD BRANCH BUTTON */}
      <div style={{ marginTop: "30px", marginBottom: "30px" }}>
        <button className="auth-btn" onClick={() => setShowForm(!showForm)}>
          ➕ Add New Branch
        </button>
      </div>

      {/* CREATE BRANCH FORM */}
      {showForm && (
        <div className="auth-card" style={{ marginTop: "20px", marginBottom: "20px" }}>
          <h3>Create New Branch</h3>

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
        <div className="success-msg" style={{ marginTop: "20px", marginBottom: "30px" }}>
          <strong>✅ Branch Manager Invite Code:</strong>
          <p style={{ fontSize: "18px", letterSpacing: "2px", fontWeight: "bold", color: "#22c55e" }}>
            {inviteCode}
          </p>
          <small>Share this code with your branch manager to register</small>
        </div>
      )}

      {/* BRANCHES TABLE */}
      {branches.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Branches ({branches.length})</h2>
          <div className="expenses-table" style={{ marginTop: "20px" }}>
            <table>
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Manager Assigned</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.branch_id}>
                    <td>{branch.branch_name}</td>
                    <td>{branch.location}</td>
                    <td>
                      <span
                        style={{
                          background: branch.status === "ACTIVE" 
                            ? "rgba(34, 197, 94, 0.15)" 
                            : "rgba(239, 68, 68, 0.15)",
                          color: branch.status === "ACTIVE" 
                            ? "#22c55e" 
                            : "#ef4444",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "500"
                        }}
                      >
                        {branch.status}
                      </span>
                    </td>
                    <td>
                      {branch.is_code_used ? (
                        <span style={{ color: "#22c55e" }}>✅ Assigned</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>⏳ Pending</span>
                      )}
                    </td>
                    <td>
                      {new Date(branch.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {branches.length === 0 && !showForm && (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          color: "#94a3b8",
          marginTop: "30px"
        }}>
          <p>No branches created yet. Click "Add New Branch" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
