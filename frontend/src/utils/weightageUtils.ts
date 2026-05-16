import type { Goal } from '../types';

export const computeTotalWeightage = (goals: Goal[]) => {
  return goals.reduce((total, goal) => total + (goal.weightage || 0), 0);
};

export const isValidWeightage = (total: number) => {
  return total === 100;
};

export const formatWeightage = (weightage: number) => {
  return `${weightage}%`;
};
