import { useEffect, useState } from 'react';
import { listUsers, assignManager, createCycle, activateCycle, emergencyUnlock, listCycles } from '../api/admin';
import { getTeamSheets } from '../api/sheets';
import type { User, Cycle, GoalSheet } from '../types';
import { Shield, Users, Calendar, Unlock, UserPlus, RefreshCw, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [allSheets, setAllSheets] = useState<GoalSheet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [newCycle, setNewCycle] = useState({ name: '', open: '', close: '' });
  const [unlockId, setUnlockId] = useState('');
  const [unlockReason, setUnlockReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, sheetData, cycleData] = await Promise.all([
        listUsers(),
        getTeamSheets(),
        listCycles()
      ]);
      setUsers(userData);
      setAllSheets(sheetData);
      setCycles(cycleData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignManager = async (userId: string, managerId: string) => {
    try {
      await assignManager(userId, managerId);
      alert('Manager assigned successfully');
      fetchData();
    } catch (err) {
      alert('Assignment failed');
    }
  };

  const handleCreateCycle = async () => {
    if (!newCycle.name || !newCycle.open || !newCycle.close) return;
    try {
      await createCycle(newCycle.name, newCycle.open, newCycle.close);
      alert('Cycle created');
      setNewCycle({ name: '', open: '', close: '' });
      fetchData();
    } catch (err) {
      alert('Creation failed');
    }
  };

  const handleActivateCycle = async (id: string) => {
    try {
      await activateCycle(id);
      alert('Cycle activated');
      fetchData();
    } catch (err) {
      alert('Activation failed');
    }
  };

  const handleUnlock = async () => {
    if (!unlockId || !unlockReason) return;
    try {
      await emergencyUnlock(unlockId, unlockReason);
      alert('Sheet unlocked to draft');
      setUnlockId('');
      setUnlockReason('');
      fetchData();
    } catch (err) {
      alert('Unlock failed');
    }
  };

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-slate-500 text-sm">Manage users, performance cycles, and emergency overrides.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Management */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold flex items-center gap-2"><Users size={18}/> User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Current Manager</th>
                  <th className="px-6 py-4">Assign Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.filter(u => u.role === 'employee').map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.department}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {users.find(m => m.id === user.manager_id)?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="text-xs border border-slate-200 rounded p-1"
                        onChange={(e) => handleAssignManager(user.id, e.target.value)}
                        value={user.manager_id || ''}
                      >
                        <option value="">Select Manager</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel: Cycle & Unlock */}
        <div className="space-y-6">
          {/* Cycle Management */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Calendar size={18}/> Cycle Setup</h3>
            <div className="space-y-3">
              <input 
                className="w-full px-3 py-2 text-sm border rounded" 
                placeholder="Cycle Name (e.g. Q3 2026)"
                value={newCycle.name}
                onChange={e => setNewCycle({...newCycle, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  className="px-3 py-2 text-xs border rounded"
                  value={newCycle.open}
                  onChange={e => setNewCycle({...newCycle, open: e.target.value})}
                />
                <input 
                  type="date" 
                  className="px-3 py-2 text-xs border rounded"
                  value={newCycle.close}
                  onChange={e => setNewCycle({...newCycle, close: e.target.value})}
                />
              </div>
              <button 
                onClick={handleCreateCycle}
                className="w-full py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700"
              >
                Create New Cycle
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Existing Cycles</p>
              {cycles.map(c => (
                <div key={c.id} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="text-xs">
                    <p className="font-bold text-slate-700">{c.phase}</p>
                    <p className="text-[10px] text-slate-400">{new Date(c.window_open).toLocaleDateString()} - {new Date(c.window_close).toLocaleDateString()}</p>
                  </div>
                  {c.is_active ? (
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                  ) : (
                    <button 
                      onClick={() => handleActivateCycle(c.id)}
                      className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-100"
                    >
                      ACTIVATE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Unlock */}
          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-amber-400">
              <Unlock size={18}/> Emergency Unlock
            </h3>
            <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest font-bold">Audit Log Required</p>
            <div className="space-y-3">
              <select 
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white"
                value={unlockId}
                onChange={e => setUnlockId(e.target.value)}
              >
                <option value="">Select Employee Sheet</option>
                {allSheets.filter(s => s.status === 'approved' || s.status === 'submitted').map(s => (
                  <option key={s.id} value={s.id}>{s.users?.name} ({s.status})</option>
                ))}
              </select>
              <textarea 
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white h-20"
                placeholder="Mandatory reason for unlock..."
                value={unlockReason}
                onChange={e => setUnlockReason(e.target.value)}
              />
              <button 
                onClick={handleUnlock}
                disabled={!unlockId || !unlockReason}
                className="w-full py-2 bg-amber-500 text-slate-900 rounded text-sm font-bold hover:bg-amber-400 disabled:opacity-50"
              >
                Execute Unlock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
