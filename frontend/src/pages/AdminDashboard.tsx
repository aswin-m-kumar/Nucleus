import { useEffect, useState } from 'react';
import { listUsers, assignManager, createCycle, activateCycle, emergencyUnlock, listCycles } from '../api/admin';
import { getTeamSheets } from '../api/sheets';
import { getAchievementReport, exportAchievementCSV } from '../api/reports';
import type { User, Cycle, GoalSheet, Quarter } from '../types';
import { Shield, Users, Calendar, Unlock, BarChart2, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [allSheets, setAllSheets] = useState<GoalSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  
  // Reports States
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportFilter, setReportFilter] = useState<{department: string, quarter: Quarter | ''}>({ department: '', quarter: '' });

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

  const fetchReports = async () => {
    try {
      const data = await getAchievementReport(reportFilter.department || undefined, reportFilter.quarter || undefined);
      setReportData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, reportFilter]);

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

  const handleExportCSV = () => {
    exportAchievementCSV(reportFilter.department || undefined, reportFilter.quarter || undefined);
  };

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  const departments = Array.from(new Set(users.map(u => u.department)));

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  const userColumns: { key: keyof typeof userDataTable[0]; header: string }[] = [
    { key: 'name', header: 'Name' },
    { key: 'department', header: 'Department' },
    { key: 'currentManager', header: 'Current Manager' },
    { key: 'assignManager', header: 'Assign Manager' },
  ];

  const userDataTable = users.filter(u => u.role === 'employee').map(user => ({
    name: (
      <div>
        <p className="font-semibold text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-400">{user.email}</p>
      </div>
    ),
    department: user.department,
    currentManager: users.find(m => m.id === user.manager_id)?.name || 'Unassigned',
    assignManager: (
      <Select 
        value={user.manager_id || ''}
        onChange={(e) => handleAssignManager(user.id, e.target.value)}
        options={[
          { label: 'Select Manager', value: '' },
          ...managers.map(m => ({ label: m.name, value: m.id }))
        ]}
      />
    )
  }));

  const reportColumns: { key: keyof typeof reportTableData[0]; header: string }[] = [
    { key: 'employee', header: 'Employee' },
    { key: 'department', header: 'Department' },
    { key: 'goal', header: 'Goal Title' },
    { key: 'quarter', header: 'Quarter' },
    { key: 'score', header: 'Score' },
    { key: 'status', header: 'Status' }
  ];

  const reportTableData = reportData.map((row) => ({
    employee: <span className="font-semibold text-slate-800">{row.employee_name}</span>,
    department: <span className="text-slate-600">{row.department}</span>,
    goal: <span className="text-slate-800 max-w-xs truncate block" title={row.goal_title}>{row.goal_title}</span>,
    quarter: <span className="font-bold text-[#534AB7]">{row.quarter}</span>,
    score: (
      <span className={`font-bold ${row.score >= 100 ? 'text-[#1D9E75]' : row.score >= 50 ? 'text-[#BA7517]' : 'text-red-500'}`}>
        {row.score.toFixed(1)}%
      </span>
    ),
    status: (
      <Badge variant={
        row.status === 'completed' ? 'completed' : 
        row.status === 'on_track' ? 'on-track' : 
        'not-started'
      }>
        {row.status.replace('_', ' ')}
      </Badge>
    )
  }));

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="text-[#534AB7]" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-slate-500 text-sm">Manage users, performance cycles, and org-wide reports.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          className={`py-3 px-6 font-bold flex items-center gap-2 ${activeTab === 'users' ? 'border-b-2 border-[#534AB7] text-[#534AB7]' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> User & Cycle Management
        </button>
        <button 
          className={`py-3 px-6 font-bold flex items-center gap-2 ${activeTab === 'reports' ? 'border-b-2 border-[#534AB7] text-[#534AB7]' : 'text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart2 size={18} /> Reports & Analytics
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management */}
          <Card className="lg:col-span-2 p-0 border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold flex items-center gap-2"><Users size={18}/> User Directory</h3>
            </div>
            <Table columns={userColumns} data={userDataTable} className="border-none rounded-none" />
          </Card>

          {/* Side Panel: Cycle & Unlock */}
          <div className="space-y-6">
            {/* Cycle Management */}
            <Card className="border border-slate-200 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 mb-4"><Calendar size={18}/> Cycle Setup</h3>
              <div className="space-y-3">
                <Input 
                  placeholder="Cycle Name (e.g. Q3 2026)"
                  value={newCycle.name}
                  onChange={e => setNewCycle({...newCycle, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="date" 
                    value={newCycle.open}
                    onChange={e => setNewCycle({...newCycle, open: e.target.value})}
                  />
                  <Input 
                    type="date" 
                    value={newCycle.close}
                    onChange={e => setNewCycle({...newCycle, close: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleCreateCycle}
                  variant="primary"
                  className="w-full mt-2"
                >
                  Create New Cycle
                </Button>
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
                      <Badge variant="completed">ACTIVE</Badge>
                    ) : (
                      <Button 
                        onClick={() => handleActivateCycle(c.id)}
                        variant="secondary"
                        size="sm"
                      >
                        ACTIVATE
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Emergency Unlock */}
            <Card className="bg-slate-900 text-white shadow-xl border-slate-800">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-[#BA7517]">
                <Unlock size={18}/> Emergency Unlock
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest font-bold">Audit Log Required</p>
              <div className="space-y-3">
                <Select 
                  value={unlockId}
                  onChange={e => setUnlockId(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  options={[
                    { label: 'Select Employee Sheet', value: '' },
                    ...allSheets.filter(s => s.status === 'approved' || s.status === 'submitted').map(s => ({
                      label: `${s.users?.name} (${s.status})`,
                      value: s.id
                    }))
                  ]}
                />
                <Textarea 
                  placeholder="Mandatory reason for unlock..."
                  value={unlockReason}
                  onChange={e => setUnlockReason(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={3}
                />
                <Button 
                  onClick={handleUnlock}
                  disabled={!unlockId || !unlockReason}
                  variant="amber"
                  className="w-full mt-2"
                >
                  Execute Unlock
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold flex items-center gap-2"><BarChart2 size={18}/> Organization Achievements</h3>
            <div className="flex items-center gap-4">
              <Select 
                value={reportFilter.department}
                onChange={(e) => setReportFilter(prev => ({ ...prev, department: e.target.value }))}
                options={[
                  { label: 'All Departments', value: '' },
                  ...departments.map(d => ({ label: d, value: d }))
                ]}
              />
              <Select 
                value={reportFilter.quarter}
                onChange={(e) => setReportFilter(prev => ({ ...prev, quarter: e.target.value as Quarter | '' }))}
                options={[
                  { label: 'All Quarters', value: '' },
                  ...(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map(q => ({ label: q, value: q }))
                ]}
              />
              <Button 
                onClick={handleExportCSV}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Download size={16} /> Export CSV
              </Button>
            </div>
          </div>
          {reportData.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No achievements logged yet for these filters.</div>
          ) : (
            <Table columns={reportColumns} data={reportTableData} className="border-none rounded-none" />
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
