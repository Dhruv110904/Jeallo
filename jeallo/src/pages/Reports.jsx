import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  FileDown, TrendingUp, BarChart, 
  PieChart as PieIcon, CheckCircle, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: () => api.get('/reports/overview').then(res => res.data),
  });

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jeallo-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1">Deep dive into project data and team performance</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <FileDown className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Completion Rate</p>
              <h4 className="text-2xl font-bold text-white">{stats?.completion_rate}%</h4>
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
              style={{ width: `${stats?.completion_rate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Tasks</p>
              <h4 className="text-2xl font-bold text-white">{stats?.in_progress || 0}</h4>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Tasks currently being worked on by the team.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Overdue Tasks</p>
              <h4 className="text-2xl font-bold text-white">{stats?.overdue || 0}</h4>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Tasks that have passed their deadline.</p>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <h3 className="text-xl font-bold text-white tracking-tight">Employee Productivity Ranking</h3>
          <BarChart className="w-5 h-5 text-slate-500" />
        </div>
        <div className="p-8">
          <div className="space-y-8">
            {stats?.employee_stats?.sort((a, b) => b.completion_rate - a.completion_rate).map((emp, idx) => (
              <div key={emp.id} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-bold text-sm w-4">{idx + 1}.</span>
                    <span className="text-sm font-bold text-slate-200">{emp.name}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                    {emp.completed} / {emp.total} Tasks
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" 
                    style={{ width: `${emp.completion_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
