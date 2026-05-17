import React, { useState } from 'react';
import type { Goal, UoMType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';

interface GoalFormProps {
  initialData?: Partial<Goal>;
  onSubmit: (data: Partial<Goal>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const THRUST_AREAS = [
  'Operational Excellence',
  'Strategic Growth',
  'Innovation & Tech',
  'Sustainability',
  'Customer Success'
];

const UOM_TYPES: { label: string; value: UoMType }[] = [
  { label: 'Minimum (Greater than or equal)', value: 'min' },
  { label: 'Maximum (Less than or equal)', value: 'max' },
  { label: 'Timeline (Completion date)', value: 'timeline' },
  { label: 'Binary (Zero tolerance/Yes-No)', value: 'zero' },
];

const GoalForm = ({ initialData, onSubmit, onCancel, isLoading }: GoalFormProps) => {
  const [formData, setFormData] = useState<Partial<Goal>>({
    thrust_area: initialData?.thrust_area || THRUST_AREAS[0],
    title: initialData?.title || '',
    description: initialData?.description || '',
    uom_type: initialData?.uom_type || 'min',
    target: initialData?.target || 0,
    weightage: initialData?.weightage || 10,
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <Select 
              label="Thrust Area"
              value={formData.thrust_area}
              onChange={(e) => setFormData({ ...formData, thrust_area: e.target.value })}
              options={THRUST_AREAS.map(area => ({ label: area, value: area }))}
            />
          </div>
          
          <div className="col-span-1">
            <Select 
              label="UoM Type"
              value={formData.uom_type}
              onChange={(e) => {
                const newType = e.target.value as UoMType;
                setFormData({ 
                  ...formData, 
                  uom_type: newType,
                  target: newType === 'zero' ? 0 : formData.target
                });
              }}
              options={UOM_TYPES}
            />
          </div>

          <div className="col-span-2">
            <Input 
              label="Goal Title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="col-span-2">
            <Textarea 
              label="Description"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {formData.uom_type !== 'zero' && (
            <div className="col-span-1">
              {formData.uom_type === 'timeline' ? (
                <Input 
                  label="Target (Date)"
                  type="date"
                  required
                  value={formData.target ? new Date(Number(formData.target)).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, target: new Date(e.target.value).getTime() })}
                />
              ) : (
                <Input 
                  label="Target (Number)"
                  type="number"
                  required
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                />
              )}
            </div>
          )}

          <div className={`col-span-1 ${formData.uom_type === 'zero' ? 'col-start-1' : ''}`}>
            <Input 
              label="Weightage (%)"
              type="number"
              required
              min={10}
              value={formData.weightage}
              onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 mt-2">
          <Button 
            type="button" 
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Goal'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GoalForm;
