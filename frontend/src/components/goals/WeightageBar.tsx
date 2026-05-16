import { computeTotalWeightage, isValidWeightage } from '../../utils/weightageUtils';
import type { Goal } from '../../types';

interface WeightageBarProps {
  goals: Goal[];
}

const WeightageBar = ({ goals }: WeightageBarProps) => {
  const total = computeTotalWeightage(goals);
  const isValid = isValidWeightage(total);

  return (
    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mt-4 relative">
      <div 
        className={`h-full transition-all duration-300 ${isValid ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ width: `${Math.min(total, 100)}%` }}
      />
      <span className="absolute right-2 top-0 text-[10px] font-bold text-slate-700">
        Total: {total}%
      </span>
    </div>
  );
};

export default WeightageBar;
