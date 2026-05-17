import { useEffect, useState } from 'react';
import { getMySheet, submitSheet, createSheet } from '../api/sheets';
import { getActiveCycle } from '../api/cycles';
import { addGoal, updateGoal, deleteGoal } from '../api/goals';
import { getSheetAchievements } from '../api/progress';
import type { GoalSheet, Goal, ProgressResponse, Quarter } from '../types';
import { useAuthStore } from '../store/authStore';
import GoalRow from '../components/goals/GoalRow';
import GoalForm from '../components/goals/GoalForm';
import WeightageBar from '../components/goals/WeightageBar';
import ProgressRow from '../components/goals/ProgressRow';
import { computeTotalWeightage, isValidWeightage } from '../utils/weightageUtils';
import { Plus, Send, Target, BarChart3, FileText, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/ui/MetricCard';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';

const EmployeeDashboard = () => {
  const user = useAuthStore((state) => state.user);
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

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-[var(--n-primary)]" />
      </div>
    );
  }

  const totalWeightage = sheet ? computeTotalWeightage(sheet.goals) : 0;
  const canSubmit = sheet && isValidWeightage(totalWeightage) && sheet.goals.length > 0 && (sheet.status === 'draft' || sheet.status === 'returned');
  const isLocked = sheet?.status === 'submitted' || sheet?.status === 'approved';

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[28px] font-semibold text-[var(--n-text)] mb-1">
              {greeting}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-[14px] text-[var(--n-text-tertiary)]">
              Cycle: {sheet?.cycle_id || 'Active Period'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                sheet?.status === 'approved' ? 'approved' :
                sheet?.status === 'submitted' ? 'submitted' :
                sheet?.status === 'returned' ? 'returned' : 'draft'
              }
              pulse={sheet?.status === 'submitted'}
            >
              {sheet?.status || 'No Sheet'}
            </Badge>
            {canSubmit && (
              <Button onClick={handleSubmitSheet} size="sm">
                <Send size={14} /> Submit for Review
              </Button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <Alert type="error" onClose={() => setError(null)} className="mb-6">
          {error}
        </Alert>
      )}

      {sheet ? (
        <div className="space-y-6">
          {/* Metric Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Goals Created"
              value={`${sheet.goals.length}`}
              unit="/ 8"
              icon={<Target size={18} />}
            />
            <MetricCard
              label="Weightage"
              value={`${totalWeightage}%`}
              icon={<BarChart3 size={18} />}
              variant={isValidWeightage(totalWeightage) ? 'primary' : 'secondary'}
            />
            <MetricCard
              label="Sheet Status"
              value={sheet.status}
              icon={<FileText size={18} />}
              variant="accent"
            />
          </div>

          {/* Weightage Bar */}
          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[15px] font-medium text-[var(--n-text)]">Weightage Summary</h3>
              <span className={`text-[13px] font-semibold ${isValidWeightage(totalWeightage) ? 'text-[var(--n-status-approved)]' : 'text-[var(--n-danger)]'}`}>
                {totalWeightage}% / 100%
              </span>
            </div>
            <WeightageBar goals={sheet.goals} />
          </Card>

          {/* View Toggle (for approved sheets) */}
          {sheet.status === 'approved' && (
            <div className="flex gap-1 bg-[var(--n-bg-subtle)] p-1 rounded-[var(--n-radius-sm)] w-fit">
              <button
                className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-[var(--n-transition)] ${
                  viewMode === 'goals'
                    ? 'bg-[var(--n-bg-card)] text-[var(--n-text)] shadow-[var(--n-shadow-sm)]'
                    : 'text-[var(--n-text-tertiary)] hover:text-[var(--n-text-secondary)]'
                }`}
                onClick={() => setViewMode('goals')}
              >
                Goals
              </button>
              <button
                className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-[var(--n-transition)] ${
                  viewMode === 'progress'
                    ? 'bg-[var(--n-bg-card)] text-[var(--n-text)] shadow-[var(--n-shadow-sm)]'
                    : 'text-[var(--n-text-tertiary)] hover:text-[var(--n-text-secondary)]'
                }`}
                onClick={() => setViewMode('progress')}
              >
                Track Progress
              </button>
            </div>
          )}

          {/* Progress View */}
          {viewMode === 'progress' && sheet.status === 'approved' ? (
            <div className="space-y-4">
              {/* Quarter Selector */}
              <div className="flex items-center gap-2">
                {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setActiveQuarter(q)}
                    className={`px-4 py-1.5 rounded-[var(--n-radius-sm)] text-[13px] font-medium transition-all duration-[var(--n-transition)] ${
                      activeQuarter === q
                        ? 'bg-[var(--n-primary)] text-white'
                        : q === currentQuarter
                          ? 'bg-[var(--n-primary-light)] text-[var(--n-primary)] border border-[var(--n-primary)] border-opacity-20'
                          : 'bg-[var(--n-bg-subtle)] text-[var(--n-text-secondary)] hover:bg-[var(--n-bg-muted)]'
                    }`}
                    title={q === currentQuarter ? 'Current quarter' : ''}
                  >
                    {q} {q === currentQuarter && '•'}
                  </button>
                ))}
              </div>

              {activeQuarter !== currentQuarter && (
                <Alert type="warning">
                  Progress can only be updated during the active calendar quarter ({currentQuarter}).
                </Alert>
              )}

              <div className="space-y-4">
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
            </div>
          ) : (
            /* Goals View */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-[18px] font-semibold text-[var(--n-text)]">My Goals</h2>
                {!isLocked && sheet.goals.length < 8 && (
                  <Button size="sm" onClick={() => setIsAdding(true)}>
                    <Plus size={14} /> Add Goal
                  </Button>
                )}
              </div>

              {sheet.goals.length === 0 ? (
                <EmptyState
                  heading="No goals added yet"
                  description="Start by clicking Add Goal to create your first performance goal."
                  action={!isLocked ? { label: 'Add Goal', onClick: () => setIsAdding(true) } : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sheet.goals.map(goal => (
                    <GoalRow
                      key={goal.id}
                      goal={goal}
                      onEdit={isLocked ? undefined : setEditingGoal}
                      onDelete={isLocked ? undefined : handleDeleteGoal}
                      readOnly={isLocked}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SlideOver forms */}
          {isAdding && (
            <GoalForm
              onSubmit={handleAddGoal}
              onCancel={() => setIsAdding(false)}
            />
          )}

          {editingGoal && (
            <GoalForm
              initialData={editingGoal}
              onSubmit={handleUpdateGoal}
              onCancel={() => setEditingGoal(null)}
            />
          )}
        </div>
      ) : (
        <Card className="text-center py-16">
          <EmptyState
            heading="No active goal sheet"
            description="Create a new sheet to start tracking your goals for this cycle."
            action={{
              label: creatingSheet ? 'Creating...' : 'Create Goal Sheet',
              onClick: handleCreateSheet,
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default EmployeeDashboard;
