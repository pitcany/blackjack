export const updateProgress = async (progress) => {
  const res = await api.put('/api/progress', progress);
  return res.data;
};
