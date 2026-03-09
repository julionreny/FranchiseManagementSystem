import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
const API = axios.create({
  baseURL: "http://localhost:5000/api/branches",
  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================
   GET BRANCHES BY FRANCHISE
========================= */
export const getBranchesByFranchise = (franchiseId) => {
  return API.get(`/franchise/${franchiseId}`);
};

/* =========================
   CREATE BRANCH
========================= */
export const createBranch = (branchData) => {
  return API.post("/create", branchData);
};

export const updateBranch = (branchId, branchData) => {
  return API.put(`/update/${branchId}`, branchData);
};

export const deleteBranch = (branchId) => {
  return API.delete(`/delete/${branchId}`);
};

export const resetInviteCode = (branchId) => {
  return API.post(`/reset-invite/${branchId}`);
};

/* =========================
   (FUTURE) GET BRANCHES
========================= */
// export const getBranchesByFranchise = (franchiseId) => {
//   return API.get(`/franchise/${franchiseId}`);
// };
