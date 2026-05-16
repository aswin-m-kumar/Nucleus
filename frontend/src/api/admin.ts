import apiClient from './client';
import type { User, GoalSheet, Cycle } from '../types';

export const listUsers = async () => {
  const response = await apiClient.get<User[]>('/admin/users');
  return response.data;
};

export const assignManager = async (userId: string, managerId: string) => {
  const response = await apiClient.patch(`/admin/users/${userId}/assign-manager`, { manager_id: managerId });
  return response.data;
};

export const listCycles = async () => {
  const response = await apiClient.get<Cycle[]>('/admin/cycles');
  return response.data;
};

export const createCycle = async (name: string, windowOpen: string, windowClose: string) => {
  const response = await apiClient.post<Cycle>('/admin/cycles', { name, window_open: windowOpen, window_close: windowClose });
  return response.data;
};

export const activateCycle = async (cycleId: string) => {
  const response = await apiClient.patch(`/admin/cycles/${cycleId}/activate`);
  return response.data;
};

export const emergencyUnlock = async (sheetId: string, reason: string) => {
  const response = await apiClient.patch(`/admin/sheets/${sheetId}/unlock`, { reason });
  return response.data;
};
