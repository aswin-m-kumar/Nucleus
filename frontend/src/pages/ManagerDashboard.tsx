import { useEffect, useState } from 'react';
import { getTeamSheets, approveSheet, returnSheet } from '../api/sheets';
import { updateGoal } from '../api/goals';
import { getTeamCheckIns, addCheckIn } from '../api/progress';
import type { GoalSheet, Goal, ProgressResponse, Quarter } from '../types';
import GoalRow from '../components/goals/GoalRow';
import { CheckCircle, RotateCcw, ChevronDown, ChevronUp, Users, Loader2 } from 'lucide-react';
import { computeScore } from '../utils/scoringUtils';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';

const ManagerDashboard = () => {
  const [sheets, setSheets] = useState<GoalSheet[]>([]);
  const [progressData, setProgressData] = useState<ProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState<string | null>(null);

  const [activeQuarter, setActiveQuarter] = useState<Quarter>('Q1');
  const [checkInComments, setCheckInComments] = useState<Record<string, string>>({});
  const [viewModes, setViewModes] = useState<Record<string, 'goals' | 'progress'>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sheetsData, pData] = await Promise.all([
        getTeamSheets(),
        getTeamCheckIns('me')
      ]);
      setSheets(sheetsData);
      setProgressData(pData);

      const initialViewModes: Record<string, 'goals' | 'progress'> = {};
      sheetsData.forEach(s => {
        initialViewModes[s.id] = s.status === 'approved' ? 'progress' : 'goals';
      });
      setViewModes(prev => ({ ...initialViewModes, ...prev }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (sheetId: string) => {
    try { await approveSheet(sheetId); fetchData(); }
    catch { alert('Failed to approve'); }
  };

  const handleReturn = async (sheetId: string) => {
    if (!comment.trim()) {
      alert('Please provide a comment for returning the sheet.');
      return;
    }
    try {
      await returnSheet(sheetId, comment);
      setShowCommentBox(null);
      setComment('');
      fetchData();
    } catch { alert('Failed to return'); }
  };

  const handleGoalUpdate = async (goalId: string, data: Partial<Goal>) => {
    try { await updateGoal(goalId, data); fetchData(); }
    catch { alert('Failed to update goal'); }
  };

  const handleSaveCheckIn = async (goalId: string) => {
    const mgrComment = checkInComments[goalId];
    if (!mgrComment) return;
    try {
      await addCheckIn(goalId, activeQuarter, mgrComment);
      setCheckInComments(prev => ({ ...prev, [goalId]: '' }));
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save check-in');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-[var(--n-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold text-[var(--n-text)] mb-1">Team Overview</h1>
        <p className="text-[14px] text-[var(--n-text-tertiary)]">
          Review and manage goal sheets for your direct reports.
        </p>
      </header>

      <div className="space-y-3">
        {sheets.length === 0 ? (
          <EmptyState
            icon={<Users size={48} strokeWidth={1.5} />}
            heading="No team submissions"
            description="No team members have started their goal sheets yet."
          />
        ) : (
          sheets.map(sheet => {
            const sheetGoals = sheet.goals;
            const sheetProgress = progressData.filter(p => sheetGoals.some(g => g.id === p.goal_id) && p.quarter === activeQuarter);

            let statusDot = 'bg-[var(--n-bg-muted)]';
            if (sheet.status === 'approved' && sheetGoals.length > 0) {
              if (sheetProgress.length === sheetGoals.length) statusDot = 'bg-[var(--n-status-approved)]';
              else if (sheetProgress.length > 0) statusDot = 'bg-[var(--n-secondary)]';
              else statusDot = 'bg-[var(--n-danger)]';
            }

            const isExpanded = expandedSheet === sheet.id;

            return (
              <Card key={sheet.id} className="p-0 overflow-hidden">
                {/* Accordion Header */}
                <button
                  className="w-full flex items-center justify-between p-5 hover:bg-[var(--n-bg-subtle)] transition-colors text-left"
                  onClick={() => setExpandedSheet(isExpanded ? null : sheet.id)}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-9 w-9 rounded-full bg-[var(--n-accent-light)] flex items-center justify-center text-[var(--n-accent)] font-semibold text-[14px]">
                      {sheet.users?.name.charAt(0)}
                      {sheet.status === 'approved' && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--n-bg-card)] ${statusDot}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-medium text-[var(--n-text)]">{sheet.users?.name}</h3>
                      <p className="text-[12px] text-[var(--n-text-tertiary)]">{sheet.users?.department} · {sheetGoals.length} goals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        sheet.status === 'approved' ? 'approved' :
                        sheet.status === 'submitted' ? 'submitted' :
                        sheet.status === 'returned' ? 'returned' : 'draft'
                      }
                      pulse={sheet.status === 'submitted'}
                    >
                      {sheet.status}
                    </Badge>
                    {isExpanded ? <ChevronUp size={18} className="text-[var(--n-text-tertiary)]" /> : <ChevronDown size={18} className="text-[var(--n-text-tertiary)]" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[var(--n-border)] animate-fade-in">
                    {/* View Toggle for approved */}
                    {sheet.status === 'approved' && (
                      <div className="flex gap-1 bg-[var(--n-bg-subtle)] p-1 rounded-[var(--n-radius-sm)] w-fit mt-4 mb-5">
                        <button
                          className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                            viewModes[sheet.id] === 'goals'
                              ? 'bg-[var(--n-bg-card)] text-[var(--n-text)] shadow-[var(--n-shadow-sm)]'
                              : 'text-[var(--n-text-tertiary)]'
                          }`}
                          onClick={() => setViewModes(prev => ({ ...prev, [sheet.id]: 'goals' }))}
                        >
                          Goals
                        </button>
                        <button
                          className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                            viewModes[sheet.id] === 'progress'
                              ? 'bg-[var(--n-bg-card)] text-[var(--n-text)] shadow-[var(--n-shadow-sm)]'
                              : 'text-[var(--n-text-tertiary)]'
                          }`}
                          onClick={() => setViewModes(prev => ({ ...prev, [sheet.id]: 'progress' }))}
                        >
                          Check-in
                        </button>
                      </div>
                    )}

                    {/* Progress View */}
                    {viewModes[sheet.id] === 'progress' && sheet.status === 'approved' ? (
                      <div className="space-y-4 mt-4">
                        <div className="flex items-center gap-2">
                          {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((q) => (
                            <button
                              key={q}
                              onClick={() => setActiveQuarter(q)}
                              className={`px-3 py-1 rounded-[var(--n-radius-sm)] text-[13px] font-medium transition-all ${
                                activeQuarter === q
                                  ? 'bg-[var(--n-primary)] text-white'
                                  : 'bg-[var(--n-bg-subtle)] text-[var(--n-text-secondary)] hover:bg-[var(--n-bg-muted)]'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>

                        <div className="overflow-x-auto border border-[var(--n-border)] rounded-[var(--n-radius-md)]">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[var(--n-bg-subtle)]">
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Goal</th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)] w-20">Target</th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)] w-20">Actual</th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)] w-16">Score</th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Feedback</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sheet.goals.map(goal => {
                                const p = progressData.find(pd => pd.goal_id === goal.id && pd.quarter === activeQuarter);
                                const score = computeScore(goal.uom_type, goal.target, p?.actual);
                                const hasProgress = p != null;

                                return (
                                  <tr key={goal.id} className="border-b border-[var(--n-border)] last:border-b-0 hover:bg-[var(--n-bg-subtle)] transition-colors">
                                    <td className="px-4 py-3 text-[14px] font-medium text-[var(--n-text)]">{goal.title}</td>
                                    <td className="px-4 py-3 text-[13px] text-[var(--n-text-secondary)]">
                                      {goal.uom_type === 'timeline' ? new Date(Number(goal.target)).toLocaleDateString() : goal.target}
                                    </td>
                                    <td className="px-4 py-3 text-[13px] font-semibold text-[var(--n-text)]">
                                      {!hasProgress ? '—' : goal.uom_type === 'timeline' ? new Date(Number(p.actual)).toLocaleDateString() : p.actual}
                                    </td>
                                    <td className="px-4 py-3">
                                      {!hasProgress ? '—' : (
                                        <span className={`text-[13px] font-semibold ${
                                          score >= 100 ? 'text-[var(--n-status-approved)]' :
                                          score >= 50 ? 'text-[var(--n-secondary)]' :
                                          'text-[var(--n-danger)]'
                                        }`}>
                                          {score.toFixed(0)}%
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      {!hasProgress ? (
                                        <span className="text-[12px] text-[var(--n-secondary)]">Pending...</span>
                                      ) : (
                                        <div className="space-y-2">
                                          {p.manager_comment && (
                                            <p className="text-[12px] text-[var(--n-text-secondary)] bg-[var(--n-bg-subtle)] px-2 py-1 rounded">
                                              {p.manager_comment}
                                            </p>
                                          )}
                                          <div className="flex gap-2 items-center">
                                            <Input
                                              type="text"
                                              placeholder="Add feedback..."
                                              value={checkInComments[goal.id] || ''}
                                              onChange={(e) => setCheckInComments(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                            />
                                            <Button
                                              disabled={!checkInComments[goal.id]}
                                              onClick={() => handleSaveCheckIn(goal.id)}
                                              size="sm"
                                            >
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* Goals View */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {sheet.goals.map(goal => (
                          <GoalRow
                            key={goal.id}
                            goal={goal}
                            readOnly={sheet.status === 'approved'}
                            onEdit={sheet.status === 'submitted' ? (g) => {
                              const newTarget = prompt('New Target:', g.target.toString());
                              if (newTarget) handleGoalUpdate(g.id, { target: Number(newTarget) });
                            } : undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* Approval Actions */}
                    {sheet.status === 'submitted' && (
                      <div className="mt-5 pt-5 border-t border-[var(--n-border)]">
                        {showCommentBox === sheet.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Reason for return..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="secondary" size="sm" onClick={() => setShowCommentBox(null)}>
                                Cancel
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleReturn(sheet.id)}>
                                Confirm Return
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowCommentBox(sheet.id)}
                            >
                              <RotateCcw size={14} /> Return
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(sheet.id)}
                            >
                              <CheckCircle size={14} /> Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
