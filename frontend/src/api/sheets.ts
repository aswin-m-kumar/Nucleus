import apiClient from './client';
import type { GoalSheet } from '../types';

export const getMySheet = async () => {
  const response = await apiClient.get<GoalSheet>('/sheets/me');
  return response.data;
};

export const createSheet = async (cycleId: string) => {
  const response = await apiClient.post<GoalSheet>('/sheets', { cycle_id: cycleId });
  return response.data;
};

export const submitSheet = async (sheetId: string) => {
  const response = await apiClient.post(`/sheets/${sheetId}/submit`);
  return response.data;
};

export const getTeamSheets = async () => {
  const response = await apiClient.get<GoalSheet[]>('/sheets/team');
  return response.data;
};

export const approveSheet = async (sheetId: string) => {
  const response = await apiClient.patch(`/sheets/${sheetId}/approve`);
  return response.data;
};

export const returnSheet = async (sheetId: string, comment: string) => {
  const response = await apiClient.patch(`/sheets/${sheetId}/return`, { comment });
  return response.data;
};
