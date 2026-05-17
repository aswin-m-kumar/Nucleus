import { useEffect, useState } from 'react';
import { listUsers, assignManager, createCycle, activateCycle, emergencyUnlock, listCycles } from '../api/admin';
import { getTeamSheets } from '../api/sheets';
import { getAchievementReport, exportAchievementCSV } from '../api/reports';
import type { User, Cycle, GoalSheet, Quarter } from '../types';
import { Shield, Users, Calendar, Unlock, BarChart2, Download, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [allSheets, setAllSheets] = useState<GoalSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'cycles' | 'reports'>('users');

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
        listUsers(), getTeamSheets(), listCycles()
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

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeTab === 'reports') fetchReports(); }, [activeTab, reportFilter]);

  const handleAssignManager = async (userId: string, managerId: string) => {
    try { await assignManager(userId, managerId); fetchData(); }
    catch { alert('Assignment failed'); }
  };

  const handleCreateCycle = async () => {
    if (!newCycle.name || !newCycle.open || !newCycle.close) return;
    try {
      await createCycle(newCycle.name, newCycle.open, newCycle.close);
      setNewCycle({ name: '', open: '', close: '' });
      fetchData();
    } catch { alert('Creation failed'); }
  };

  const handleActivateCycle = async (id: string) => {
    try { await activateCycle(id); fetchData(); }
    catch { alert('Activation failed'); }
  };

  const handleUnlock = async () => {
    if (!unlockId || !unlockReason) return;
    try {
      await emergencyUnlock(unlockId, unlockReason);
      setUnlockId('');
      setUnlockReason('');
      fetchData();
    } catch { alert('Unlock failed'); }
  };

  const handleExportCSV = () => {
    exportAchievementCSV(reportFilter.department || undefined, reportFilter.quarter || undefined);
  };

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  const departments = Array.from(new Set(users.map(u => u.department)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-[var(--n-primary)]" />
      </div>
    );
  }

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'cycles' as const, label: 'Cycles', icon: Calendar },
    { id: 'reports' as const, label: 'Reports', icon: BarChart2 },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--n-radius-md)] bg-[var(--n-accent-light)] flex items-center justify-center">
          <Shield size={20} className="text-[var(--n-accent)]" />
        </div>
        <div>
          <h1 className="text-[28px] font-semibold text-[var(--n-text)]">Admin</h1>
          <p className="text-[14px] text-[var(--n-text-tertiary)]">Manage users, cycles, and reports.</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-[var(--n-bg-subtle)] p-1 rounded-[var(--n-radius-sm)] w-fit mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-[var(--n-transition)] ${
              activeTab === tab.id
                ? 'bg-[var(--n-bg-card)] text-[var(--n-text)] shadow-[var(--n-shadow-sm)]'
                : 'text-[var(--n-text-tertiary)] hover:text-[var(--n-text-secondary)]'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--n-border)] flex items-center justify-between bg-[var(--n-bg-subtle)]">
            <h3 className="text-[15px] font-medium text-[var(--n-text)] flex items-center gap-2">
              <Users size={16} /> User Directory
            </h3>
            <span className="text-[12px] text-[var(--n-text-tertiary)]">{users.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--n-bg)]">
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Name</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Department</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Role</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Manager</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Assign</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'employee').map(user => (
                  <tr key={user.id} className="border-b border-[var(--n-border)] last:border-b-0 hover:bg-[var(--n-bg-subtle)] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--n-accent-light)] flex items-center justify-center text-[var(--n-accent)] text-[12px] font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[var(--n-text)]">{user.name}</p>
                          <p className="text-[12px] text-[var(--n-text-tertiary)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[var(--n-text-secondary)]">{user.department}</td>
                    <td className="px-5 py-3">
                      <Badge variant="draft">{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[var(--n-text-secondary)]">
                      {users.find(m => m.id === user.manager_id)?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Select
                        value={user.manager_id || ''}
                        onChange={(e) => handleAssignManager(user.id, e.target.value)}
                        options={[
                          { label: 'Select', value: '' },
                          ...managers.map(m => ({ label: m.name, value: m.id }))
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cycles Tab */}
      {activeTab === 'cycles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Cycle Form */}
          <Card className="lg:col-span-1">
            <h3 className="text-[15px] font-medium text-[var(--n-text)] flex items-center gap-2 mb-4">
              <Calendar size={16} /> New Cycle
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="Cycle Name (e.g. Q3 2026)"
                value={newCycle.name}
                onChange={e => setNewCycle({...newCycle, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" label="Opens" value={newCycle.open} onChange={e => setNewCycle({...newCycle, open: e.target.value})} />
                <Input type="date" label="Closes" value={newCycle.close} onChange={e => setNewCycle({...newCycle, close: e.target.value})} />
              </div>
              <Button onClick={handleCreateCycle} className="w-full">Create Cycle</Button>
            </div>
          </Card>

          {/* Existing Cycles */}
          <div className="lg:col-span-2 space-y-3">
            {cycles.length === 0 ? (
              <EmptyState heading="No cycles" description="Create your first performance cycle." />
            ) : (
              cycles.map(c => (
                <Card
                  key={c.id}
                  className={`flex items-center justify-between ${c.is_active ? 'border-l-4 border-l-[var(--n-primary)]' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[15px] font-medium text-[var(--n-text)]">{c.phase}</p>
                      {c.is_active && <Badge variant="approved">Active</Badge>}
                    </div>
                    <p className="text-[12px] text-[var(--n-text-tertiary)]">
                      {new Date(c.window_open).toLocaleDateString()} — {new Date(c.window_close).toLocaleDateString()}
                    </p>
                  </div>
                  {!c.is_active && (
                    <Button variant="secondary" size="sm" onClick={() => handleActivateCycle(c.id)}>
                      Activate
                    </Button>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Emergency Unlock */}
          <Card className="lg:col-span-3 bg-[#1A1918] text-white border-[#333]">
            <h3 className="text-[15px] font-medium text-[var(--n-secondary)] flex items-center gap-2 mb-1">
              <Unlock size={16} /> Emergency Unlock
            </h3>
            <p className="text-[12px] text-[#888] uppercase tracking-[1px] font-medium mb-4">Audit log required</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Select
                value={unlockId}
                onChange={e => setUnlockId(e.target.value)}
                className="bg-[#242422] border-[#444] text-white"
                options={[
                  { label: 'Select Sheet', value: '' },
                  ...allSheets.filter(s => s.status === 'approved' || s.status === 'submitted').map(s => ({
                    label: `${s.users?.name} (${s.status})`,
                    value: s.id
                  }))
                ]}
              />
              <Textarea
                placeholder="Reason for unlock..."
                value={unlockReason}
                onChange={e => setUnlockReason(e.target.value)}
                className="bg-[#242422] border-[#444] text-white"
                rows={2}
              />
              <Button
                onClick={handleUnlock}
                disabled={!unlockId || !unlockReason}
                variant="amber"
              >
                Execute Unlock
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--n-border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--n-bg-subtle)]">
            <h3 className="text-[15px] font-medium text-[var(--n-text)] flex items-center gap-2">
              <BarChart2 size={16} /> Achievement Reports
            </h3>
            <div className="flex items-center gap-3">
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
              <Button variant="amber" size="sm" onClick={handleExportCSV}>
                <Download size={14} /> Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="bg-[var(--n-bg)]">
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Employee</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Department</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Goal</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Quarter</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Score</th>
                  <th className="px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[var(--n-text-tertiary)]">
                      No data for these filters.
                    </td>
                  </tr>
                ) : (
                  reportData.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--n-border)] last:border-b-0 hover:bg-[var(--n-bg-subtle)] transition-colors">
                      <td className="px-5 py-3 font-medium text-[var(--n-text)]">{row.employee_name}</td>
                      <td className="px-5 py-3 text-[var(--n-text-secondary)]">{row.department}</td>
                      <td className="px-5 py-3 text-[var(--n-text)] max-w-xs truncate" title={row.goal_title}>{row.goal_title}</td>
                      <td className="px-5 py-3 font-semibold text-[var(--n-accent)]">{row.quarter}</td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${
                          row.score >= 100 ? 'text-[var(--n-status-approved)]' :
                          row.score >= 50 ? 'text-[var(--n-secondary)]' :
                          'text-[var(--n-danger)]'
                        }`}>
                          {row.score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={
                          row.status === 'completed' ? 'completed' :
                          row.status === 'on_track' ? 'on-track' :
                          'not-started'
                        }>
                          {row.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
