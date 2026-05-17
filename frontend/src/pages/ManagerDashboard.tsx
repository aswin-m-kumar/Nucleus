import { useEffect, useState } from 'react';
import { getTeamSheets, approveSheet, returnSheet } from '../api/sheets';
import { updateGoal } from '../api/goals';
import { getTeamCheckIns, addCheckIn } from '../api/progress';
import type { GoalSheet, Goal, ProgressResponse, Quarter } from '../types';
import GoalRow from '../components/goals/GoalRow';
import { CheckCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { computeScore } from '../utils/scoringUtils';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';

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
        getTeamCheckIns('me') // Backend will use token for manager_id
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
    try {
      await approveSheet(sheetId);
      fetchData();
    } catch (err) {
      alert('Failed to approve');
    }
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
    } catch (err) {
      alert('Failed to return');
    }
  };

  const handleGoalUpdate = async (goalId: string, data: Partial<Goal>) => {
    try {
      await updateGoal(goalId, data);
      fetchData();
    } catch (err) {
      alert('Failed to update goal');
    }
  };

  const handleSaveCheckIn = async (goalId: string) => {
    const mgrComment = checkInComments[goalId];
    if (!mgrComment) return;
    try {
      await addCheckIn(goalId, activeQuarter, mgrComment);
      // Clear input and refresh
      setCheckInComments(prev => ({ ...prev, [goalId]: '' }));
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save check-in');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading team goals...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Overview</h1>
      <p className="text-slate-500 mb-10">Review and manage goal sheets for your direct reports.</p>

      <div className="space-y-4">
        {sheets.length === 0 ? (
          <Card className="p-20 text-center">
            <p className="text-slate-400">No team members have started their goal sheets yet.</p>
          </Card>
        ) : (
          sheets.map(sheet => {
            // Determine progress visual state
            const sheetGoals = sheet.goals;
            const sheetProgress = progressData.filter(p => sheetGoals.some(g => g.id === p.goal_id) && p.quarter === activeQuarter);
            let progressColor = 'bg-slate-100'; // none
            if (sheet.status === 'approved' && sheetGoals.length > 0) {
              if (sheetProgress.length === sheetGoals.length) {
                progressColor = 'bg-[#1D9E75]'; // all updated
              } else if (sheetProgress.length > 0) {
                progressColor = 'bg-[#BA7517]'; // partial
              } else {
                progressColor = 'bg-red-500'; // none
              }
            }

            return (
              <Card key={sheet.id} className="overflow-hidden p-0 border-none shadow-sm bg-white">
                <div 
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200 rounded-xl"
                  onClick={() => setExpandedSheet(expandedSheet === sheet.id ? null : sheet.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#534AB7] font-bold">
                      {sheet.users?.name.charAt(0)}
                      {sheet.status === 'approved' && (
                        <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${progressColor}`} title="Update Status"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{sheet.users?.name}</h3>
                      <p className="text-xs text-slate-500">{sheet.users?.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <Badge variant={
                      sheet.status === 'approved' ? 'approved' : 
                      sheet.status === 'submitted' ? 'submitted' : 
                      sheet.status === 'returned' ? 'returned' : 'draft'
                    }>
                      {sheet.status}
                    </Badge>
                    {expandedSheet === sheet.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </div>
                </div>

                {expandedSheet === sheet.id && (
                  <div className="p-6 border border-t-0 border-slate-200 rounded-b-xl bg-slate-50 -mt-2">
                    {sheet.status === 'approved' && (
                      <div className="flex border-b border-slate-200 mb-6 mt-2">
                        <button 
                          className={`py-2 px-6 font-medium text-sm ${viewModes[sheet.id] === 'goals' ? 'border-b-2 border-[#1D9E75] text-[#1D9E75]' : 'text-slate-500 hover:text-slate-800'}`}
                          onClick={() => setViewModes(prev => ({ ...prev, [sheet.id]: 'goals' }))}
                        >
                          Goal Details
                        </button>
                        <button 
                          className={`py-2 px-6 font-medium text-sm flex items-center gap-2 ${viewModes[sheet.id] === 'progress' ? 'border-b-2 border-[#1D9E75] text-[#1D9E75]' : 'text-slate-500 hover:text-slate-800'}`}
                          onClick={() => setViewModes(prev => ({ ...prev, [sheet.id]: 'progress' }))}
                        >
                          Quarterly Check-in
                        </button>
                      </div>
                    )}

                    {viewModes[sheet.id] === 'progress' && sheet.status === 'approved' ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                          <h4 className="font-bold text-slate-800">Check-in Context ({activeQuarter})</h4>
                          <div className="flex gap-2">
                            {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((q) => (
                              <button
                                key={q}
                                onClick={() => setActiveQuarter(q)}
                                className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                                  activeQuarter === q 
                                    ? 'bg-[#1D9E75] text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                                <th className="p-4 font-semibold">Goal</th>
                                <th className="p-4 font-semibold w-24">Target</th>
                                <th className="p-4 font-semibold w-24">Actual</th>
                                <th className="p-4 font-semibold w-20">Score</th>
                                <th className="p-4 font-semibold">Manager Feedback</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {sheet.goals.map(goal => {
                                const p = progressData.find(pd => pd.goal_id === goal.id && pd.quarter === activeQuarter);
                                const score = computeScore(goal.uom_type, goal.target, p?.actual);
                                const hasProgress = p != null;

                                return (
                                  <tr key={goal.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4">
                                      <p className="font-medium text-slate-900 line-clamp-2">{goal.title}</p>
                                    </td>
                                    <td className="p-4 text-slate-600">
                                      {goal.uom_type === 'timeline' ? new Date(Number(goal.target)).toLocaleDateString() : goal.target}
                                    </td>
                                    <td className="p-4 font-bold text-slate-800">
                                      {!hasProgress ? '-' : goal.uom_type === 'timeline' ? new Date(Number(p.actual)).toLocaleDateString() : p.actual}
                                    </td>
                                    <td className="p-4">
                                      {!hasProgress ? '-' : (
                                        <span className={`font-bold ${score >= 100 ? 'text-[#1D9E75]' : score >= 50 ? 'text-[#BA7517]' : 'text-red-500'}`}>
                                          {score.toFixed(0)}%
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      {!hasProgress ? (
                                        <span className="text-xs text-[#BA7517]">Waiting for employee...</span>
                                      ) : (
                                        <div className="flex flex-col gap-2">
                                          {p.manager_comment ? (
                                            <Alert type="info" className="py-2 px-3 text-xs">
                                              {p.manager_comment}
                                            </Alert>
                                          ) : null}
                                          <div className="flex gap-2 items-start">
                                            <div className="flex-1">
                                              <Input 
                                                type="text" 
                                                placeholder="Add feedback..."
                                                value={checkInComments[goal.id] || ''}
                                                onChange={(e) => setCheckInComments(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                              />
                                            </div>
                                            <Button 
                                              disabled={!checkInComments[goal.id]}
                                              onClick={() => handleSaveCheckIn(goal.id)}
                                              variant="primary"
                                              className="mt-0"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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

                    {sheet.status === 'submitted' && (
                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                        {showCommentBox === sheet.id ? (
                          <div className="w-full flex flex-col gap-2">
                            <Textarea 
                              placeholder="Reason for return..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button 
                                variant="secondary"
                                onClick={() => setShowCommentBox(null)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="danger"
                                onClick={() => handleReturn(sheet.id)}
                              >
                                Confirm Return
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button 
                              variant="secondary"
                              onClick={() => setShowCommentBox(sheet.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                            >
                              <RotateCcw size={16} /> Return for Rework
                            </Button>
                            <Button 
                              variant="primary"
                              onClick={() => handleApprove(sheet.id)}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle size={16} /> Approve Sheet
                            </Button>
                          </>
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
