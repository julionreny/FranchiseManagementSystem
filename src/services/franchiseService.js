import axios from "axios";

export const getOwnerFranchise = (ownerId) => {
  return axios.get(`http://localhost:5000/api/franchises/owner/${ownerId}`);
};
