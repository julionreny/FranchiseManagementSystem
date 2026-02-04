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
   CREATE BRANCH
========================= */
export const createBranch = (branchData) => {
  return API.post("/create", branchData);
};

/* =========================
   (FUTURE) GET BRANCHES
========================= */
// export const getBranchesByFranchise = (franchiseId) => {
//   return API.get(`/franchise/${franchiseId}`);
// };
