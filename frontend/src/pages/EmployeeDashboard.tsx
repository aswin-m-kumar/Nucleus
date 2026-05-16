import { useEffect, useState } from 'react';
import { getMySheet, submitSheet, createSheet } from '../api/sheets';
import { getActiveCycle } from '../api/cycles';
import { addGoal, updateGoal, deleteGoal } from '../api/goals';
import type { GoalSheet, Goal } from '../types';
import GoalRow from '../components/goals/GoalRow';
import GoalForm from '../components/goals/GoalForm';
import WeightageBar from '../components/goals/WeightageBar';
import { computeTotalWeightage, isValidWeightage } from '../utils/weightageUtils';
import { Plus, Send, RefreshCw, AlertCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const [sheet, setSheet] = useState<GoalSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingSheet, setCreatingSheet] = useState(false);

  const fetchSheet = async () => {
    try {
      setLoading(true);
      const data = await getMySheet();
      setSheet(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheet();
  }, []);

  const handleAddGoal = async (goalData: Partial<Goal>) => {
    if (!sheet) return;
    try {
      setError(null);
      await addGoal(sheet.id, goalData);
      setIsAdding(false);
      fetchSheet();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateGoal = async (goalData: Partial<Goal>) => {
    if (!editingGoal) return;
    try {
      setError(null);
      await updateGoal(editingGoal.id, goalData);
      setEditingGoal(null);
      fetchSheet();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      setError(null);
      await deleteGoal(goalId);
      fetchSheet();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitSheet = async () => {
    if (!sheet) return;
    try {
      setError(null);
      await submitSheet(sheet.id);
      fetchSheet();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateSheet = async () => {
    try {
      setCreatingSheet(true);
      setError(null);
      const activeCycle = await getActiveCycle();
      await createSheet(activeCycle.id);
      await fetchSheet();
    } catch (err: any) {
      const backendError = err.response?.data?.detail;
      setError(backendError || err.message || 'Failed to create sheet');
    } finally {
      setCreatingSheet(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading your goals...</div>;

  const totalWeightage = sheet ? computeTotalWeightage(sheet.goals) : 0;
  const canSubmit = sheet && isValidWeightage(totalWeightage) && sheet.goals.length > 0 && (sheet.status === 'draft' || sheet.status === 'returned');
  const isLocked = sheet?.status === 'submitted' || sheet?.status === 'approved';

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Goals</h1>
          <p className="text-slate-500">Cycle: {sheet?.cycle_id || 'Active Period'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            sheet?.status === 'approved' ? 'bg-green-100 text-green-700' : 
            sheet?.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 
            'bg-amber-100 text-amber-700'
          }`}>
            {sheet?.status || 'No Sheet'}
          </span>
          {canSubmit && (
            <button 
              onClick={handleSubmitSheet}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
            >
              <Send size={16} /> Submit for Approval
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {sheet ? (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Weightage Summary</h3>
              <span className={`text-sm font-bold ${isValidWeightage(totalWeightage) ? 'text-green-600' : 'text-red-600'}`}>
                {totalWeightage}% / 100%
              </span>
            </div>
            <WeightageBar goals={sheet.goals} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sheet.goals.map(goal => (
              editingGoal?.id === goal.id ? (
                <div className="col-span-1 md:col-span-2" key={goal.id}>
                  <GoalForm 
                    initialData={goal} 
                    onSubmit={handleUpdateGoal} 
                    onCancel={() => setEditingGoal(null)} 
                  />
                </div>
              ) : (
                <GoalRow 
                  key={goal.id} 
                  goal={goal} 
                  onEdit={isLocked ? undefined : setEditingGoal}
                  onDelete={isLocked ? undefined : handleDeleteGoal}
                  readOnly={isLocked}
                />
              )
            ))}
            
            {!isLocked && !isAdding && sheet.goals.length < 8 && (
              <button 
                onClick={() => setIsAdding(true)}
                className="col-span-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
              >
                <Plus size={32} className="mb-2" />
                <span className="font-medium">Add New Goal</span>
              </button>
            )}
          </div>

          {isAdding && (
            <GoalForm 
              onSubmit={handleAddGoal} 
              onCancel={() => setIsAdding(false)} 
            />
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <RefreshCw size={48} className="mx-auto text-slate-300 mb-4 animate-spin-slow" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No active goal sheet</h3>
          <p className="text-slate-500 mb-6">Create a new sheet to start tracking your goals for this cycle.</p>
          <button 
            onClick={handleCreateSheet}
            disabled={creatingSheet}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creatingSheet ? 'Creating...' : 'Create Goal Sheet'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
