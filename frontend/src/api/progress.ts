import apiClient from './client';
import type { ProgressResponse } from '../types';

export const logAchievement = async (goalId: string, quarter: string, actual: number, status: string) => {
  const response = await apiClient.post<ProgressResponse>(`/achievements/${goalId}`, { quarter, actual, status });
  return response.data;
};

export const updateAchievement = async (goalId: string, quarter: string, actual: number, status: string) => {
  const response = await apiClient.patch<ProgressResponse>(`/achievements/${goalId}/${quarter}`, { actual, status });
  return response.data;
};

export const getSheetAchievements = async (sheetId: string) => {
  const response = await apiClient.get<ProgressResponse[]>(`/achievements/sheet/${sheetId}`);
  return response.data;
};

export const addCheckIn = async (goalId: string, quarter: string, comment: string) => {
  const response = await apiClient.post<ProgressResponse>(`/checkins/${goalId}/${quarter}`, { manager_comment: comment });
  return response.data;
};

export const getTeamCheckIns = async (managerId: string) => {
  const response = await apiClient.get<ProgressResponse[]>(`/checkins/team/${managerId}`);
  return response.data;
};
