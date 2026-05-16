import React, { useState } from 'react';
import type { Goal, UoMType } from '../../types';

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Thrust Area</label>
          <select 
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.thrust_area}
            onChange={(e) => setFormData({ ...formData, thrust_area: e.target.value })}
          >
            {THRUST_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
        
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">UoM Type</label>
          <select 
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.uom_type}
            onChange={(e) => {
              const newType = e.target.value as UoMType;
              setFormData({ 
                ...formData, 
                uom_type: newType,
                target: newType === 'zero' ? 0 : formData.target
              });
            }}
          >
            {UOM_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Goal Title</label>
          <input 
            type="text"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
          <textarea 
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {formData.uom_type !== 'zero' && (
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Target {formData.uom_type === 'timeline' ? '(Date)' : '(Number)'}
            </label>
            {formData.uom_type === 'timeline' ? (
              <input 
                type="date"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.target ? new Date(Number(formData.target)).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, target: new Date(e.target.value).getTime() })}
              />
            ) : (
              <input 
                type="number"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
              />
            )}
          </div>
        )}

        <div className={`col-span-1 ${formData.uom_type === 'zero' ? 'col-start-1' : ''}`}>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Weightage (%)</label>
          <input 
            type="number"
            required
            min={10}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.weightage}
            onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-top border-slate-100">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Goal'}
        </button>
      </div>
    </form>
  );
};

export default GoalForm;
