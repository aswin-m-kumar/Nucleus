import apiClient from './client';
import type { Goal } from '../types';

export const addGoal = async (sheetId: string, goal: Partial<Goal>) => {
  const response = await apiClient.post<Goal>(`/goals/sheets/${sheetId}/goals`, goal);
  return response.data;
};

export const updateGoal = async (goalId: string, goal: Partial<Goal>) => {
  const response = await apiClient.patch<Goal>(`/goals/${goalId}`, goal);
  return response.data;
};

export const deleteGoal = async (goalId: string) => {
  const response = await apiClient.delete(`/goals/${goalId}`);
  return response.data;
};
