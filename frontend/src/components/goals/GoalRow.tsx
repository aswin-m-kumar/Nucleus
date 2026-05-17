import type { Goal } from '../../types';
import { Edit2, Trash2, Lock, Share2 } from 'lucide-react';
import { Card } from '../ui/Card';

interface GoalRowProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  readOnly?: boolean;
}

const GoalRow = ({ goal, onEdit, onDelete, readOnly }: GoalRowProps) => {
  return (
    <Card className={`p-4 ${goal.is_shared ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200'} transition-shadow hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded uppercase">
            {goal.thrust_area}
          </span>
          {goal.is_shared && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-[10px] font-bold text-indigo-600 rounded uppercase">
              <Share2 size={10} /> Shared
            </span>
          )}
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit?.(goal)}
              className="p-1.5 text-slate-400 hover:text-[#1D9E75] hover:bg-teal-50 rounded transition-colors"
            >
              <Edit2 size={16} />
            </button>
            {!goal.is_shared && (
              <button 
                onClick={() => onDelete?.(goal.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
        {readOnly && <Lock size={14} className="text-slate-300" />}
      </div>

      <h4 className="font-semibold text-slate-900 mb-1">{goal.title}</h4>
      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{goal.description}</p>
      
      <div className="flex items-center gap-4 text-xs font-medium">
        {goal.uom_type !== 'zero' && (
          <div className="flex flex-col">
            <span className="text-slate-400 uppercase tracking-tighter">Target</span>
            <span className="text-slate-700">
              {goal.uom_type === 'timeline' 
                ? new Date(Number(goal.target)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : goal.target} 
              <span className="text-slate-400 ml-1">({goal.uom_type})</span>
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-tighter">Weightage</span>
          <span className={`font-bold ${goal.weightage < 10 ? 'text-red-500' : 'text-slate-700'}`}>
            {goal.weightage}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default GoalRow;
