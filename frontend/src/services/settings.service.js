import api from "./api";

export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

export const updateSettings = async (updates) => {
  const { data } = await api.put("/settings", updates);
  return data;
};
