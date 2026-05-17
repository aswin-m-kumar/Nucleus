import type { Goal } from '../../types';
import { Edit2, Trash2, Lock, Share2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GoalRowProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  readOnly?: boolean;
}

const GoalRow = ({ goal, onEdit, onDelete, readOnly }: GoalRowProps) => {
  return (
    <Card hover={!readOnly} className="group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="draft">{goal.thrust_area}</Badge>
          {goal.is_shared && (
            <Badge variant="on-track">
              <Share2 size={10} className="mr-1" /> Shared
            </Badge>
          )}
        </div>

        {!readOnly ? (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(goal)}
              className="p-1.5 rounded-[var(--n-radius-sm)] text-[var(--n-text-tertiary)] hover:text-[var(--n-primary)] hover:bg-[var(--n-primary-light)] transition-colors"
              aria-label="Edit goal"
            >
              <Edit2 size={15} />
            </button>
            {!goal.is_shared && (
              <button
                onClick={() => onDelete?.(goal.id)}
                className="p-1.5 rounded-[var(--n-radius-sm)] text-[var(--n-text-tertiary)] hover:text-[var(--n-danger)] hover:bg-[var(--n-danger-light)] transition-colors"
                aria-label="Delete goal"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ) : (
          <Lock size={14} className="text-[var(--n-text-tertiary)] opacity-40" />
        )}
      </div>

      <h4 className="text-[15px] font-medium text-[var(--n-text)] mb-1 leading-snug">
        {goal.title}
      </h4>
      {goal.description && (
        <p className="text-[13px] text-[var(--n-text-secondary)] line-clamp-2 mb-4">
          {goal.description}
        </p>
      )}

      <div className="flex items-center gap-5 pt-3 border-t border-[var(--n-border)]">
        {goal.uom_type !== 'zero' && (
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
              Target
            </span>
            <span className="text-[14px] font-medium text-[var(--n-text)]">
              {goal.uom_type === 'timeline'
                ? new Date(Number(goal.target)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : goal.target}
              <span className="text-[var(--n-text-tertiary)] text-[12px] ml-1">({goal.uom_type})</span>
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
            Weight
          </span>
          <span className={`text-[14px] font-semibold ${
            goal.weightage < 10 ? 'text-[var(--n-danger)]' : 'text-[var(--n-text)]'
          }`}>
            {goal.weightage}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default GoalRow;
