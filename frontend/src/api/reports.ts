import apiClient from './client';

export const getAchievementReport = async (department?: string, quarter?: string) => {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (quarter) params.append('quarter', quarter);
  
  const response = await apiClient.get(`/reports/achievement?${params.toString()}`);
  return response.data;
};

export const getCompletionReport = async (quarter: string) => {
  const response = await apiClient.get(`/reports/completion?quarter=${quarter}`);
  return response.data;
};

export const exportAchievementCSV = async (department?: string, quarter?: string) => {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (quarter) params.append('quarter', quarter);
  
  const response = await apiClient.get(`/reports/achievement/export?${params.toString()}`, {
    responseType: 'blob', // Important for downloading files
  });
  
  // Trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `achievement_report_${quarter || 'all'}.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
