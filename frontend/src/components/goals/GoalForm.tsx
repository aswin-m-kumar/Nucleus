import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Goal, UoMType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { SlideOver } from '../ui/SlideOver';
import { Badge } from '../ui/Badge';

interface GoalFormProps {
  initialData?: Partial<Goal>;
  onSubmit: (data: Partial<Goal>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  open?: boolean;
}

const THRUST_AREAS = [
  'Operational Excellence',
  'Strategic Growth',
  'Innovation & Tech',
  'Sustainability',
  'Customer Success'
];

const UOM_TYPES: { label: string; value: UoMType }[] = [
  { label: 'Minimum', value: 'min' },
  { label: 'Maximum', value: 'max' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'Binary', value: 'zero' },
];

const GoalForm = ({ initialData, onSubmit, onCancel, isLoading, open = true }: GoalFormProps) => {
  const [formData, setFormData] = useState<Partial<Goal>>({
    thrust_area: initialData?.thrust_area || THRUST_AREAS[0],
    title: initialData?.title || '',
    description: initialData?.description || '',
    uom_type: initialData?.uom_type || 'min',
    target: initialData?.target || 0,
    weightage: initialData?.weightage || 10,
    ...initialData
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData?.id;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Select
        label="Thrust Area"
        value={formData.thrust_area}
        onChange={(e) => setFormData({ ...formData, thrust_area: e.target.value })}
        options={THRUST_AREAS.map(area => ({ label: area, value: area }))}
      />

      <Input
        label="Goal Title"
        type="text"
        required
        placeholder="e.g. Increase revenue by 20%"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      <Textarea
        label="Description"
        rows={3}
        placeholder="Describe what success looks like..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      {/* UoM Segmented Control */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)]">
          Measurement Type
        </label>
        <div className="flex bg-[var(--n-bg-subtle)] rounded-[var(--n-radius-sm)] p-1 gap-1">
          {UOM_TYPES.map(uom => (
            <button
              key={uom.value}
              type="button"
              onClick={() => setFormData({
                ...formData,
                uom_type: uom.value,
                target: uom.value === 'zero' ? 0 : formData.target
              })}
              className={`flex-1 py-1.5 px-2 rounded-[6px] text-[13px] font-medium transition-all duration-[var(--n-transition)] ${
                formData.uom_type === uom.value
                  ? 'bg-[var(--n-bg-card)] text-[var(--n-text)] shadow-[var(--n-shadow-sm)]'
                  : 'text-[var(--n-text-tertiary)] hover:text-[var(--n-text-secondary)]'
              }`}
            >
              {uom.label}
            </button>
          ))}
        </div>
      </div>

      {formData.uom_type !== 'zero' && (
        <div>
          {formData.uom_type === 'timeline' ? (
            <Input
              label="Target Date"
              type="date"
              required
              value={formData.target ? new Date(Number(formData.target)).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, target: new Date(e.target.value).getTime() })}
            />
          ) : (
            <Input
              label={`Target (${formData.uom_type === 'min' ? '≥ minimum' : '≤ maximum'})`}
              type="number"
              required
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
            />
          )}
        </div>
      )}

      <Input
        label="Weightage (%)"
        type="number"
        required
        min={10}
        max={100}
        value={formData.weightage}
        onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
      />

      {/* Live Preview */}
      <div className="border border-[var(--n-border)] rounded-[var(--n-radius-sm)] p-4 bg-[var(--n-bg-subtle)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] mb-2">
          Preview
        </p>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="draft">{formData.thrust_area}</Badge>
          <Badge variant="on-track">{formData.uom_type}</Badge>
        </div>
        <p className="text-[14px] font-medium text-[var(--n-text)]">
          {formData.title || 'Untitled Goal'}
        </p>
        <div className="flex gap-4 mt-2 text-[12px] text-[var(--n-text-secondary)]">
          {formData.uom_type !== 'zero' && <span>Target: {formData.target}</span>}
          <span>Weight: {formData.weightage}%</span>
        </div>
      </div>
    </form>
  );

  const footerContent = (
    <>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button loading={isLoading} onClick={(e) => { e.preventDefault(); onSubmit(formData); }}>
        {isEditing ? 'Update Goal' : 'Save Goal'}
      </Button>
    </>
  );

  return (
    <SlideOver
      open={open}
      onClose={onCancel}
      title={isEditing ? 'Edit Goal' : 'Add New Goal'}
      footer={footerContent}
    >
      {formContent}
    </SlideOver>
  );
};

export default GoalForm;
