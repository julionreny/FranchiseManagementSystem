import { useEffect, useState, useCallback } from "react";
import { getBranchesByFranchise, createBranch, updateBranch, deleteBranch, resetInviteCode } from "../../services/branchService";
import { 
  FiPlus, FiMapPin, FiMail, FiKey, FiCheckCircle, 
  FiClock, FiSearch, FiEdit3, FiRefreshCw, FiMoreVertical, 
  FiTrash2, FiRefreshCcw 
} from "react-icons/fi";
import "./OwnerAddOns.css";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [form, setForm] = useState({
    branch_name: "",
    location: "",
    manager_email: "",
    status: "ACTIVE"
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [lastInviteCode, setLastInviteCode] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const fetchBranches = useCallback(async () => {
    if (!franchiseId) return;
    setLoading(true);
    try {
      const res = await getBranchesByFranchise(franchiseId);
      const data = res.data || [];
      setBranches(data);
      setFilteredBranches(data);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
    setLoading(false);
  }, [franchiseId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Click outside to close menu
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const filtered = branches.filter(b => 
      b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.manager_email && b.manager_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === "add") {
        const res = await createBranch({
          franchise_id: franchiseId,
          ...form
        });
        setLastInviteCode(res.data.invite_code);
        alert("Branch created and invitation sent!");
      } else {
        await updateBranch(selectedBranchId, form);
        alert("Branch updated successfully!");
      }
      setShowModal(false);
      setForm({ branch_name: "", location: "", manager_email: "", status: "ACTIVE" });
      fetchBranches();
    } catch (err) {
      alert(err.response?.data?.error || "Task failed");
    }
    setSubmitting(false);
  };

  const openEditModal = (branch) => {
    setModalMode("edit");
    setSelectedBranchId(branch.branch_id);
    setForm({
      branch_name: branch.branch_name,
      location: branch.location,
      manager_email: branch.manager_email || "",
      status: branch.status || "ACTIVE"
    });
    setLastInviteCode(null);
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setForm({ branch_name: "", location: "", manager_email: "", status: "ACTIVE" });
    setLastInviteCode(null);
    setShowModal(true);
  };

  const handleDeleteBranch = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch? This will remove all associated sales, expenses, and inventory data.")) {
      try {
        await deleteBranch(branchId);
        fetchBranches();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleResetInvite = async (branchId) => {
    try {
      if (window.confirm("Regenerate invite code and resend email?")) {
        await resetInviteCode(branchId);
        fetchBranches();
      }
    } catch (err) {
      console.error("Reset invite error:", err);
    }
  };

  return (
    <div className="addon-page">
      <div className="addon-header">
        <div>
          <h1>🏢 Branch Management</h1>
          <p className="addon-subtitle">Professional control over your franchise network</p>
        </div>
        <button className="addon-btn" onClick={openAddModal}>
          <FiPlus /> Add New Branch
        </button>
      </div>

      {lastInviteCode && (
        <div className="invite-banner">
          <div className="invite-banner-text">
            <strong>Success!</strong> Invitation email sent. 
            Backup Code: <span className="invite-code-pill">{lastInviteCode}</span>
          </div>
          <button onClick={() => setLastInviteCode(null)} className="btn-secondary" style={{ padding: "4px 8px", border: "none" }}>✕</button>
        </div>
      )}

      <div className="addon-controls">
        <div className="search-wrapper">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search by name, location or email..." 
            className="addon-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary" onClick={fetchBranches} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiRefreshCw className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="branches-grid">
        {loading && branches.length === 0 ? (
          <p>Loading your network...</p>
        ) : filteredBranches.length === 0 ? (
          <p>No branches match your search.</p>
        ) : filteredBranches.map(b => (
          <div key={b.branch_id} className="branch-card glass-card">
            <div className="branch-card-header">
              <h3>{b.branch_name}</h3>
              <span className={`status-badge ${b.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                {b.status}
              </span>
            </div>
            
            <div className="branch-info-row">
              <FiMapPin /> <span>{b.location}</span>
            </div>
            <div className="branch-info-row">
              <FiMail /> <span>{b.manager_email || "No manager assigned"}</span>
            </div>
            <div className="branch-info-row">
              {b.manager_id ? (
                <><FiCheckCircle color="#10b981" /> <span style={{ color: "#10b981", fontWeight: "600" }}>Active Manager</span></>
              ) : b.manager_invite_code ? (
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#f59e0b", marginBottom: "8px" }}>
                    <FiClock /> <span style={{ fontWeight: "600" }}>Pending Registration</span>
                  </div>
                  <div className="invite-code-display" style={{ 
                    background: "rgba(245, 158, 11, 0.1)", 
                    padding: "8px 12px", 
                    borderRadius: "8px", 
                    border: "1px dashed rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Invite Token</span>
                    <code style={{ color: "#f59e0b", fontWeight: "700", letterSpacing: "1px" }}>{b.manager_invite_code}</code>
                  </div>
                </div>
              ) : (
                <><FiUsers color="#94a3b8" /> <span style={{ color: "#94a3b8" }}>No Manager Assigned</span></>
              )}
            </div>

            <div className="branch-stats-mini">
              <div className="stat-item">
                <span>Revenue</span>
                <strong>₹{Number(b.revenue || 0).toLocaleString()}</strong>
              </div>
              <div className="stat-item">
                <span>Profit</span>
                <strong style={{ color: (b.revenue - b.expenses) >= 0 ? "#10b981" : "#ef4444" }}>
                  ₹{Number((b.revenue || 0) - (b.expenses || 0)).toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="branch-actions">
              <button className="action-btn-icon" title="Edit Branch" onClick={() => openEditModal(b)}>
                <FiEdit3 size={16} />
              </button>
              <div className="branch-options">
                <button 
                  className="action-btn-icon" 
                  title="More Options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === b.branch_id ? null : b.branch_id);
                  }}
                >
                  <FiMoreVertical size={16} />
                </button>
                {activeMenu === b.branch_id && (
                  <div className="options-dropdown">
                    {!b.manager_id && (
                      <button onClick={() => { handleResetInvite(b.branch_id); setActiveMenu(null); }}>
                        <FiRefreshCcw /> Reset/Resend Invite
                      </button>
                    )}
                    <button className="delete-option" onClick={() => { handleDeleteBranch(b.branch_id); setActiveMenu(null); }}>
                      <FiTrash2 /> Delete Branch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2 className="modal-title">{modalMode === "add" ? "Register New Branch" : "Edit Branch Details"}</h2>
            <p className="addon-subtitle" style={{ marginBottom: "24px" }}>
              {modalMode === "add" ? "This will send an invite to the manager's email." : "Update the branch information below."}
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Branch Name</label>
                <input 
                  required
                  className="modal-input"
                  value={form.branch_name}
                  onChange={e => setForm({ ...form, branch_name: e.target.value })}
                  placeholder="e.g. Skyline Mall Outlet"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  required
                  className="modal-input"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. 45th Ave, New York"
                />
              </div>
              <div className="form-group">
                <label>Manager Email</label>
                <input 
                  required
                  type="email"
                  className="modal-input"
                  value={form.manager_email}
                  onChange={e => setForm({ ...form, manager_email: e.target.value })}
                  placeholder="manager@franchise.com"
                />
              </div>
              
              {modalMode === "edit" && (
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="modal-input"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="addon-btn" disabled={submitting}>
                  {submitting ? "Processing..." : modalMode === "add" ? "Create & Invite" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
