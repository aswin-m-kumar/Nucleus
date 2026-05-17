import { useState, useEffect } from 'react';
import type { Goal, ProgressResponse, Quarter, ProgressStatus } from '../../types';
import { computeScore } from '../../utils/scoringUtils';
import { logAchievement } from '../../api/progress';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

interface ProgressRowProps {
  goal: Goal;
  quarter: Quarter;
  initialProgress?: ProgressResponse;
  isEditable: boolean;
  onSaved: () => void;
}

const ProgressRow = ({ goal, quarter, initialProgress, isEditable, onSaved }: ProgressRowProps) => {
  const [actual, setActual] = useState<string>(initialProgress?.actual?.toString() || '');
  const [status, setStatus] = useState<ProgressStatus>(initialProgress?.status || 'not_started');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActual(initialProgress?.actual?.toString() || '');
    setStatus(initialProgress?.status || 'not_started');
  }, [initialProgress, quarter]);

  const score = computeScore(goal.uom_type, goal.target, actual === '' ? null : Number(actual));

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const numericActual = actual === '' ? 0 : Number(actual);
      await logAchievement(goal.id, quarter, numericActual, status);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isChanged = 
    actual !== (initialProgress?.actual?.toString() || '') ||
    status !== (initialProgress?.status || 'not_started');

  return (
    <Card className="mb-4 !p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-900">{goal.title}</h4>
        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded uppercase">
          {goal.thrust_area}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-medium mb-4">
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-tighter">Target ({goal.uom_type})</span>
          <span className="text-slate-700">
            {goal.uom_type === 'timeline' 
              ? new Date(Number(goal.target)).toLocaleDateString()
              : goal.target} 
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 uppercase tracking-tighter">Computed Score</span>
          <span className={`font-bold ${score >= 100 ? 'text-[#1D9E75]' : score >= 50 ? 'text-[#BA7517]' : 'text-red-500'}`}>
            {score.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 items-end">
        <div>
          {goal.uom_type === 'timeline' ? (
            <Input 
              label="Actual"
              type="date" 
              disabled={!isEditable}
              value={actual ? new Date(Number(actual)).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const dateVal = e.target.value ? new Date(e.target.value).getTime().toString() : '';
                setActual(dateVal);
              }}
            />
          ) : goal.uom_type === 'zero' ? (
            <Input 
              label="Actual"
              type="number"
              disabled={!isEditable}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="0"
            />
          ) : (
             <Input 
              label="Actual"
              type="number" 
              disabled={!isEditable}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
          )}
        </div>
        <div>
          <Select 
            label="Status"
            disabled={!isEditable}
            value={status}
            onChange={(e) => setStatus(e.target.value as ProgressStatus)}
            options={[
              { label: 'Not Started', value: 'not_started' },
              { label: 'On Track', value: 'on_track' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
        </div>
        <div>
          <Button 
            disabled={!isEditable || !isChanged || saving}
            onClick={handleSave}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Actual'}
          </Button>
        </div>
      </div>
      
      {error && <Alert type="error" className="mt-4" onClose={() => setError(null)}>{error}</Alert>}

      {initialProgress?.manager_comment && (
        <Alert type="info" className="mt-4">
          <span className="font-bold block mb-1">Manager Feedback:</span>
          {initialProgress.manager_comment}
        </Alert>
      )}
    </Card>
  );
};

export default ProgressRow;
