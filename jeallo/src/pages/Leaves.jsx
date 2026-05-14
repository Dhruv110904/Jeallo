import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Calendar, Plane, Briefcase, Plus, 
  Clock, CheckCircle2, XCircle, Info,
  ChevronLeft, ChevronRight, Filter, Download,
  FileText, CalendarDays, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Leaves() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'casual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const { data: statsData } = useQuery({
    queryKey: ['leave-stats'],
    queryFn: () => api.get('/v1/leaves/stats').then(res => res.data),
  });

  const { data: historyData } = useQuery({
    queryKey: ['leave-history', page],
    queryFn: () => api.get('/v1/leaves', { params: { page } }).then(res => res.data),
  });

  const applyLeaveMutation = useMutation({
    mutationFn: (data) => api.post('/v1/leaves', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['leave-stats']);
      queryClient.invalidateQueries(['leave-history']);
      setIsModalOpen(false);
      setFormData({ type: 'casual', start_date: '', end_date: '', reason: '' });
      toast.success('Leave application submitted!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Submission failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    applyLeaveMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-slate-500 font-medium">Request time off and track your leave balance.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-jeallo-gradient text-white rounded-2xl font-black text-lg shadow-xl shadow-jeallo-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
            <Plus className="w-6 h-6" />
            APPLY FOR LEAVE
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Remaining Balance', value: statsData?.leave_balance || 0, icon: CalendarDays, color: 'bg-jeallo-primary' },
          { label: 'Total Applied', value: statsData?.total_applied || 0, icon: FileText, color: 'bg-jeallo-orange' },
          { label: 'Approved', value: statsData?.approved || 0, icon: CheckCircle2, color: 'bg-done-green' },
          { label: 'Pending', value: statsData?.pending || 0, icon: Clock, color: 'bg-deadline-amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Leave History */}
        <div className="lg:col-span-3">
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-900">Application History</h3>
                    <div className="flex gap-2">
                        <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50 transition-all"><Download className="w-4 h-4" /></button>
                        <button className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:bg-slate-50 transition-all"><Filter className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-6 pb-2">Leave Type</th>
                                <th className="px-6 pb-2">Period</th>
                                <th className="px-6 pb-2">Days</th>
                                <th className="px-6 pb-2">Reason</th>
                                <th className="px-6 pb-2 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData?.data.map((leave) => (
                                <tr key={leave.id} className="bg-white hover:bg-slate-50 transition-all group border border-slate-50">
                                    <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50 group-hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${
                                                leave.type === 'sick' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {leave.type[0]}
                                            </div>
                                            <span className="font-black text-slate-900 capitalize">{leave.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                                        <div className="text-sm font-bold text-slate-600">
                                            {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                                        <span className="font-black text-slate-900">{leave.days} Days</span>
                                    </td>
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100 max-w-xs truncate">
                                        <span className="text-slate-400 text-xs font-medium">{leave.reason}</span>
                                    </td>
                                    <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-50 group-hover:border-slate-100 text-right">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                            leave.status === 'approved' ? 'bg-done-green/10 text-done-green' :
                                            leave.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-deadline-amber/10 text-deadline-amber'
                                        }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Apply for Leave</h2>
                <p className="text-sm font-medium text-slate-400 mb-8">Please fill in the details for your leave request.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Leave Type</label>
                        <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20"
                        >
                            <option value="casual">Casual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="annual">Annual Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
                            <input 
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
                            <input 
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Leave</label>
                        <textarea 
                            required
                            rows="4"
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            placeholder="Please provide a brief reason for your request..."
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20 resize-none"
                        ></textarea>
                    </div>

                    {applyLeaveMutation.isPending ? (
                        <div className="w-full bg-slate-100 py-5 rounded-2xl flex items-center justify-center gap-3">
                            <Clock className="w-6 h-6 animate-spin text-slate-400" />
                            <span className="font-black text-slate-400 uppercase tracking-widest">Submitting...</span>
                        </div>
                    ) : (
                        <button 
                            type="submit"
                            className="w-full bg-jeallo-gradient text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            SUBMIT REQUEST
                        </button>
                    )}
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
