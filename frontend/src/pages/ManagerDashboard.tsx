import { useEffect, useState } from 'react';
import { getTeamSheets, approveSheet, returnSheet } from '../api/sheets';
import { updateGoal } from '../api/goals';
import type { GoalSheet, Goal } from '../types';
import GoalRow from '../components/goals/GoalRow';
import { CheckCircle, RotateCcw, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const ManagerDashboard = () => {
  const [sheets, setSheets] = useState<GoalSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState<string | null>(null);

  const fetchTeamSheets = async () => {
    try {
      setLoading(true);
      const data = await getTeamSheets();
      setSheets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamSheets();
  }, []);

  const handleApprove = async (sheetId: string) => {
    try {
      await approveSheet(sheetId);
      fetchTeamSheets();
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
      fetchTeamSheets();
    } catch (err) {
      alert('Failed to return');
    }
  };

  const handleGoalUpdate = async (goalId: string, data: Partial<Goal>) => {
    try {
      await updateGoal(goalId, data);
      fetchTeamSheets();
    } catch (err) {
      alert('Failed to update goal');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading team goals...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Overview</h1>
      <p className="text-slate-500 mb-10">Review and manage goal sheets for your direct reports.</p>

      <div className="space-y-4">
        {sheets.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-xl border border-slate-200">
            <p className="text-slate-400">No team members have started their goal sheets yet.</p>
          </div>
        ) : (
          sheets.map(sheet => (
            <div key={sheet.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div 
                className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedSheet(expandedSheet === sheet.id ? null : sheet.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {sheet.users?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{sheet.users?.name}</h3>
                    <p className="text-xs text-slate-500">{sheet.users?.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    sheet.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    sheet.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {sheet.status}
                  </span>
                  {expandedSheet === sheet.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {expandedSheet === sheet.id && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
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

                  {sheet.status === 'submitted' && (
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                      {showCommentBox === sheet.id ? (
                        <div className="w-full flex flex-col gap-2">
                          <textarea 
                            className="w-full p-3 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Reason for return..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setShowCommentBox(null)}
                              className="px-4 py-2 text-sm text-slate-600"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleReturn(sheet.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                            >
                              Confirm Return
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => setShowCommentBox(sheet.id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <RotateCcw size={16} /> Return for Rework
                          </button>
                          <button 
                            onClick={() => handleApprove(sheet.id)}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle size={16} /> Approve Sheet
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
