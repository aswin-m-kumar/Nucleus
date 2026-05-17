import { computeTotalWeightage } from '../../utils/weightageUtils';
import type { Goal } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

interface WeightageBarProps {
  goals: Goal[];
}

const WeightageBar = ({ goals }: WeightageBarProps) => {
  const total = computeTotalWeightage(goals);

  return (
    <ProgressBar
      value={total}
      label="Total Weightage"
      variant="weightage"
    />
  );
};

export default WeightageBar;
