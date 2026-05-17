import { useState, useEffect } from 'react';
import type { Goal, ProgressResponse, Quarter, ProgressStatus } from '../../types';
import { computeScore } from '../../utils/scoringUtils';
import { logAchievement } from '../../api/progress';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';

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
    <Card className="animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-[15px] font-medium text-[var(--n-text)]">{goal.title}</h4>
        <Badge variant="draft">{goal.thrust_area}</Badge>
      </div>

      <div className="flex items-center gap-6 text-[13px] mb-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
            Target ({goal.uom_type})
          </span>
          <span className="text-[var(--n-text)] font-medium">
            {goal.uom_type === 'timeline'
              ? new Date(Number(goal.target)).toLocaleDateString()
              : goal.target}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
            Score
          </span>
          <span className={`font-semibold ${
            score >= 100 ? 'text-[var(--n-status-approved)]' :
            score >= 50 ? 'text-[var(--n-secondary)]' :
            'text-[var(--n-danger)]'
          }`}>
            {score.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 items-end">
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
          ) : (
            <Input
              label="Actual"
              type="number"
              disabled={!isEditable}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="0"
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
            loading={saving}
            onClick={handleSave}
            className="w-full"
          >
            Save
          </Button>
        </div>
      </div>

      {error && <Alert type="error" className="mt-3" onClose={() => setError(null)}>{error}</Alert>}

      {initialProgress?.manager_comment && (
        <Alert type="info" className="mt-3">
          <span className="font-semibold block mb-0.5 text-[13px]">Manager Feedback</span>
          <span className="text-[13px]">{initialProgress.manager_comment}</span>
        </Alert>
      )}
    </Card>
  );
};

export default ProgressRow;
