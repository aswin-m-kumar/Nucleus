import { useEffect, useState } from 'react';
import { getMySheet, submitSheet, createSheet } from '../api/sheets';
import { getActiveCycle } from '../api/cycles';
import { addGoal, updateGoal, deleteGoal } from '../api/goals';
import { getSheetAchievements } from '../api/progress';
import type { GoalSheet, Goal, ProgressResponse, Quarter } from '../types';
import GoalRow from '../components/goals/GoalRow';
import GoalForm from '../components/goals/GoalForm';
import WeightageBar from '../components/goals/WeightageBar';
import ProgressRow from '../components/goals/ProgressRow';
import { computeTotalWeightage, isValidWeightage } from '../utils/weightageUtils';
import { Plus, Send, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert as AlertComponent } from '../components/ui/Alert';

const EmployeeDashboard = () => {
  const [sheet, setSheet] = useState<GoalSheet | null>(null);
  const [progressData, setProgressData] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creatingSheet, setCreatingSheet] = useState(false);
  
  const [activeQuarter, setActiveQuarter] = useState<Quarter>('Q1');
  const [viewMode, setViewMode] = useState<'goals' | 'progress'>('goals');

  const fetchSheet = async () => {
    try {
      setLoading(true);
      const data = await getMySheet();
      setSheet(data);
      if (data && data.status === 'approved') {
        fetchProgress(data.id);
        setViewMode('progress');
      } else {
        setViewMode('goals');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (sheetId: string) => {
    try {
      const pData = await getSheetAchievements(sheetId);
      setProgressData(pData);
    } catch (err) {
      console.error('Failed to fetch progress', err);
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

  const currentMonth = new Date().getMonth();
  const currentQuarter: Quarter = currentMonth < 3 ? 'Q1' : currentMonth < 6 ? 'Q2' : currentMonth < 9 ? 'Q3' : 'Q4';

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
          <Badge variant={
            sheet?.status === 'approved' ? 'approved' : 
            sheet?.status === 'submitted' ? 'submitted' : 
            sheet?.status === 'returned' ? 'returned' : 'draft'
          }>
            {sheet?.status || 'No Sheet'}
          </Badge>
          {canSubmit && (
            <Button onClick={handleSubmitSheet} className="flex items-center gap-2">
              <Send size={16} /> Submit for Approval
            </Button>
          )}
        </div>
      </header>

      {error && (
        <AlertComponent type="error" onClose={() => setError(null)} className="mb-6">
          {error}
        </AlertComponent>
      )}

      {sheet ? (
        <div className="space-y-6">
          <Card className="bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Weightage Summary</h3>
              <span className={`text-sm font-bold ${isValidWeightage(totalWeightage) ? 'text-green-600' : 'text-red-600'}`}>
                {totalWeightage}% / 100%
              </span>
            </div>
            <WeightageBar goals={sheet.goals} />
          </Card>

          {sheet.status === 'approved' && (
            <div className="flex border-b border-slate-200 mb-6">
              <button 
                className={`py-3 px-6 font-medium text-sm ${viewMode === 'goals' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => setViewMode('goals')}
              >
                Goal Details
              </button>
              <button 
                className={`py-3 px-6 font-medium text-sm ${viewMode === 'progress' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => setViewMode('progress')}
              >
                Track Progress
              </button>
            </div>
          )}

          {viewMode === 'progress' && sheet.status === 'approved' ? (
            <Card className="bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Quarterly Check-ins</h3>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => setActiveQuarter(q)}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${
                        activeQuarter === q 
                          ? 'bg-[#1D9E75] text-white' 
                          : q === currentQuarter 
                          ? 'text-[#1D9E75] bg-teal-50 border border-teal-200' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title={q === currentQuarter ? "Current Active Quarter" : ""}
                    >
                      {q} {q === currentQuarter && '📍'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {activeQuarter !== currentQuarter && (
                  <AlertComponent type="warning">
                    Progress can only be updated during the active calendar quarter ({currentQuarter}).
                  </AlertComponent>
                )}
                {sheet.goals.map(goal => {
                  const p = progressData.find(pd => pd.goal_id === goal.id && pd.quarter === activeQuarter);
                  return (
                    <ProgressRow 
                      key={goal.id} 
                      goal={goal} 
                      quarter={activeQuarter}
                      initialProgress={p}
                      isEditable={activeQuarter === currentQuarter}
                      onSaved={() => fetchProgress(sheet.id)}
                    />
                  );
                })}
              </div>
            </Card>
          ) : (
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
                  className="col-span-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-[#1D9E75] hover:text-[#1D9E75] hover:bg-teal-50 transition-all"
                >
                  <Plus size={32} className="mb-2" />
                  <span className="font-medium">Add New Goal</span>
                </button>
              )}
            </div>
          )}

          {isAdding && viewMode === 'goals' && (
            <GoalForm 
              onSubmit={handleAddGoal} 
              onCancel={() => setIsAdding(false)} 
            />
          )}
        </div>
      ) : (
        <Card className="text-center py-20 border-slate-200">
          <RefreshCw size={48} className="mx-auto text-slate-300 mb-4 animate-spin-slow" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No active goal sheet</h3>
          <p className="text-slate-500 mb-6">Create a new sheet to start tracking your goals for this cycle.</p>
          <Button 
            onClick={handleCreateSheet}
            disabled={creatingSheet}
          >
            {creatingSheet ? 'Creating...' : 'Create Goal Sheet'}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDashboard;
