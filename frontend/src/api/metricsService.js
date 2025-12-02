import axios from "./apiClient";

export const getDeployments = async () => {
  const res = await axios.get("/deployments");
  return res.data;
};

export const getDeploymentById = async (id) => {
  const res = await axios.get(`/deployments/${id}`);
  return res.data;
};
