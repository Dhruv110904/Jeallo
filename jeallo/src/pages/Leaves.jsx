import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Calendar, Plane, Briefcase, Plus, 
  Clock, CheckCircle2, XCircle, Info,
  ChevronLeft, ChevronRight, Filter, Download,
  FileText, CalendarDays, AlertCircle, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

export default function Leaves() {
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const isAdmin = ['admin', 'super_admin'].includes(role?.toLowerCase());

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewRemark, setReviewRemark] = useState('');

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
      queryClient.invalidateQueries({ queryKey: ['leave-stats'] });
      queryClient.invalidateQueries({ queryKey: ['leave-history'] });
      setIsModalOpen(false);
      setFormData({ type: 'casual', start_date: '', end_date: '', reason: '' });
      toast.success('Leave application submitted!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Submission failed'),
  });

  const updateLeaveStatusMutation = useMutation({
    mutationFn: ({ id, status, admin_remark }) => 
      api.patch(`/v1/leaves/${id}`, { status, admin_remark }).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leave-stats'] });
      queryClient.invalidateQueries({ queryKey: ['leave-history'] });
      toast.success(data.message || `Leave request processed!`);
      setSelectedLeave(null);
      setReviewRemark('');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update leave request'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    applyLeaveMutation.mutate(formData);
  };

  const getLeaveTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'sick':
        return 'bg-red-50 text-red-500 border border-red-100';
      case 'casual':
        return 'bg-blue-50 text-blue-500 border border-blue-100';
      case 'annual':
        return 'bg-emerald-50 text-emerald-500 border border-emerald-100';
      case 'unpaid':
        return 'bg-amber-50 text-amber-500 border border-amber-100';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-100';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-jeallo-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-jeallo-orange/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse delay-1000"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-jeallo-primary/10 text-jeallo-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {isAdmin ? 'ADMIN CONSOLE' : 'TIME OFF MANAGEMENT'}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {isAdmin ? 'Leave Requests' : 'Leave Management'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isAdmin 
              ? 'Review, approve, or decline employee leave applications and track statistics.' 
              : 'Request time off and track your personal leave balance.'}
          </p>
        </div>
        {!isAdmin && (
          <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-jeallo-gradient text-white rounded-2xl font-black text-lg shadow-xl shadow-jeallo-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
              <Plus className="w-6 h-6" />
              APPLY FOR LEAVE
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(isAdmin ? [
          { label: 'Pending Approvals', value: statsData?.pending || 0, icon: Clock, colorClass: 'bg-amber-50 text-amber-500 border border-amber-100' },
          { label: 'Total Requests', value: statsData?.total_applied || 0, icon: FileText, colorClass: 'bg-blue-50 text-blue-500 border border-blue-100' },
          { label: 'Approved Requests', value: statsData?.approved || 0, icon: CheckCircle2, colorClass: 'bg-emerald-50 text-emerald-500 border border-emerald-100' },
          { label: 'Rejected Requests', value: statsData?.rejected || 0, icon: XCircle, colorClass: 'bg-rose-50 text-rose-500 border border-rose-100' },
        ] : [
          { label: 'Remaining Balance', value: statsData?.leave_balance ?? 0, icon: CalendarDays, colorClass: 'bg-violet-50 text-violet-500 border border-violet-100' },
          { label: 'Total Applied', value: statsData?.total_applied || 0, icon: FileText, colorClass: 'bg-orange-50 text-orange-500 border border-orange-100' },
          { label: 'Approved Requests', value: statsData?.approved || 0, icon: CheckCircle2, colorClass: 'bg-emerald-50 text-emerald-500 border border-emerald-100' },
          { label: 'Pending Requests', value: statsData?.pending || 0, icon: Clock, colorClass: 'bg-amber-50 text-amber-500 border border-amber-100' },
        ]).map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className={`w-14 h-14 ${stat.colorClass} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Leave History Table */}
        <div>
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <h3 className="text-xl font-black text-slate-900">
                      {isAdmin ? 'All Leave Applications' : 'Application History'}
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-3 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm"><Download className="w-4 h-4" /></button>
                        <button className="p-3 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition-all shadow-sm"><Filter className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {isAdmin && <th className="px-6 pb-2">Employee</th>}
                                <th className="px-6 pb-2">Leave Type</th>
                                <th className="px-6 pb-2">Period</th>
                                <th className="px-6 pb-2">Days</th>
                                <th className="px-6 pb-2">Reason</th>
                                <th className="px-6 pb-2 text-right">
                                  {isAdmin ? 'Status / Action' : 'Status'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {!historyData?.data || historyData.data.length === 0 ? (
                              <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="text-center py-16 text-slate-400 font-bold bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                  No leave requests found.
                                </td>
                              </tr>
                            ) : (
                              historyData.data.map((leave) => (
                                <tr key={leave.id} className="bg-white hover:bg-slate-50/50 transition-all group">
                                    {isAdmin && (
                                      <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50 group-hover:border-slate-100">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs shrink-0 border border-slate-200">
                                            {leave.user?.avatar ? (
                                              <img src={leave.user.avatar} alt={leave.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                              leave.user?.name?.charAt(0).toUpperCase() || 'U'
                                            )}
                                          </div>
                                          <div>
                                            <span className="font-black text-slate-900 block leading-tight">{leave.user?.name || 'Unknown User'}</span>
                                            <span className="text-slate-400 text-[10px] font-bold block">{leave.user?.designation || 'Employee'}</span>
                                          </div>
                                        </div>
                                      </td>
                                    )}
                                    <td className={`px-6 py-5 border-y border-slate-50 group-hover:border-slate-100 ${!isAdmin ? 'rounded-l-2xl border-l' : ''}`}>
                                        <div className="flex items-center">
                                            <div className={`px-3 py-1 rounded-lg text-xs font-black capitalize ${getLeaveTypeStyle(leave.type)}`}>
                                                {leave.type}
                                            </div>
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
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100 max-w-xs">
                                        <div className="text-slate-500 text-xs font-medium truncate">{leave.reason}</div>
                                        {leave.admin_remark && (
                                            <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                                <Info className="w-3.5 h-3.5 text-slate-400 inline shrink-0" />
                                                <span className="italic truncate">"{leave.admin_remark}"</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-50 group-hover:border-slate-100 text-right">
                                        {isAdmin && leave.status === 'pending' ? (
                                          <button
                                            onClick={() => {
                                              setSelectedLeave(leave);
                                              setReviewRemark('');
                                            }}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-sm shadow-slate-900/10 uppercase tracking-wider"
                                          >
                                            Review
                                          </button>
                                        ) : (
                                          <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                                leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                leave.status === 'rejected' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {leave.status}
                                            </span>
                                            {leave.approver && (
                                              <span className="text-[9px] text-slate-400 font-bold block">
                                                by {leave.approver.name}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                    </td>
                                </tr>
                              ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {historyData && historyData.last_page > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Showing {historyData.from || 0} - {historyData.to || 0} of {historyData.total || 0} Requests
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-black text-slate-900 min-w-[5rem] text-center">
                        Page {page} / {historyData.last_page}
                      </span>
                      <button 
                        onClick={() => setPage(p => Math.min(historyData.last_page, p + 1))}
                        disabled={page >= historyData.last_page}
                        className="p-3 border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* Apply Leave Modal (Employee) */}
      {isModalOpen && !isAdmin && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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

      {/* Admin Review Leave Modal */}
      {selectedLeave && isAdmin && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLeave(null)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Review Leave Request</h2>
                <p className="text-sm font-medium text-slate-400 mb-6">Review employee's leave request details and take action.</p>

                {/* Employee Card */}
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center font-black text-slate-500 text-lg shrink-0 border border-slate-300">
                    {selectedLeave.user?.avatar ? (
                      <img src={selectedLeave.user.avatar} alt={selectedLeave.user.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedLeave.user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">{selectedLeave.user?.name || 'Unknown User'}</h4>
                    <p className="text-slate-400 text-xs font-bold">{selectedLeave.user?.designation || 'Employee'}</p>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Leave Type</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black inline-block capitalize ${getLeaveTypeStyle(selectedLeave.type)}`}>
                      {selectedLeave.type}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Duration</span>
                    <span className="font-black text-slate-800 text-sm">{selectedLeave.days} Days</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Date Period</span>
                    <span className="font-bold text-slate-700 text-sm">
                      {format(new Date(selectedLeave.start_date), 'MMMM dd, yyyy')} - {format(new Date(selectedLeave.end_date), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Reason</span>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{selectedLeave.reason}"</p>
                  </div>
                </div>

                {/* Admin Remarks Input */}
                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Remarks (Optional)</label>
                  <textarea 
                    rows="3"
                    value={reviewRemark}
                    onChange={(e) => setReviewRemark(e.target.value)}
                    placeholder="Add any notes like 'Get well soon' or specific reasons for decision..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-medium text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20 resize-none text-sm"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      updateLeaveStatusMutation.mutate({ 
                        id: selectedLeave.id, 
                        status: 'rejected', 
                        admin_remark: reviewRemark 
                      });
                    }}
                    disabled={updateLeaveStatusMutation.isPending}
                    className="flex-1 bg-red-50 text-red-500 py-4.5 rounded-2xl font-black text-base hover:bg-red-100 transition-all active:scale-95 text-center flex items-center justify-center gap-2 border border-red-100"
                  >
                    <XCircle className="w-5 h-5" />
                    DECLINE
                  </button>
                  <button 
                    onClick={() => {
                      updateLeaveStatusMutation.mutate({ 
                        id: selectedLeave.id, 
                        status: 'approved', 
                        admin_remark: reviewRemark 
                      });
                    }}
                    disabled={updateLeaveStatusMutation.isPending}
                    className="flex-1 bg-jeallo-gradient text-white py-4.5 rounded-2xl font-black text-base shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    APPROVE
                  </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

