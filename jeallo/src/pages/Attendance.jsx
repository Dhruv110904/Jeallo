import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Clock, Calendar, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownLeft, Timer, MapPin,
  History, Download, Filter, ChevronLeft, ChevronRight,
  Coffee, Laptop
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

export default function Attendance() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { role } = useAuthStore();
  const isAdmin = ['admin', 'super_admin'].includes(role?.toLowerCase());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['attendance-status'],
    queryFn: () => api.get('/v1/attendance/status').then(res => res.data),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['attendance-history', page],
    queryFn: () => api.get('/v1/attendance', { params: { page } }).then(res => res.data),
  });

  const checkInMutation = useMutation({
    mutationFn: () => api.post('/v1/attendance/check-in'),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance-status']);
      queryClient.invalidateQueries(['attendance-history']);
      toast.success('Checked in successfully!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Check-in failed'),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => api.post('/v1/attendance/check-out'),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance-status']);
      queryClient.invalidateQueries(['attendance-history']);
      toast.success('Checked out successfully!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Check-out failed'),
  });

  const handleExport = async () => {
    try {
      const response = await api.get('/v1/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jeallo-attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('Attendance report exported successfully!');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  const isCheckedIn = statusData?.is_checked_in;
  const isCheckedOut = statusData?.is_checked_out;
  const todayRecord = statusData?.attendance;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance System</h1>
          <p className="text-slate-500 font-medium">Track your daily work hours and manage your presence.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Time</p>
                <p className="text-lg font-black text-slate-900">{format(currentTime, 'HH:mm:ss')}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Check-In/Out Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-jeallo-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10 text-center space-y-8">
                <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${
                    isCheckedIn ? 'bg-done-green text-white animate-pulse' : 'bg-slate-50 text-slate-300'
                }`}>
                    <Clock className="w-12 h-12" />
                </div>

                <div>
                    <h3 className="text-2xl font-black text-slate-900">
                        {isCheckedIn ? 'You are Clocked In' : isCheckedOut ? 'Work Finished' : 'Ready to Work?'}
                    </h3>
                    <p className="text-sm font-bold text-slate-400 mt-2">
                        {isCheckedIn 
                            ? `Working since ${todayRecord?.check_in}` 
                            : isCheckedOut 
                                ? `Total hours: ${todayRecord?.working_hours}h` 
                                : 'Start your shift to begin tracking time.'}
                    </p>
                </div>

                <div className="pt-4">
                    {!isCheckedIn && !isCheckedOut && (
                        <button 
                            onClick={() => checkInMutation.mutate()}
                            disabled={checkInMutation.isPending}
                            className="w-full bg-jeallo-gradient text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <ArrowUpRight className="w-6 h-6" />
                            CHECK IN NOW
                        </button>
                    )}

                    {isCheckedIn && (
                        <button 
                            onClick={() => checkOutMutation.mutate()}
                            disabled={checkOutMutation.isPending}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <ArrowDownLeft className="w-6 h-6" />
                            CHECK OUT
                        </button>
                    )}

                    {isCheckedOut && (
                        <div className="bg-slate-50 py-4 rounded-2xl text-slate-400 font-black text-sm border border-dashed border-slate-200">
                            COMPLETED FOR TODAY
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                        <p className="text-sm font-black text-slate-900">{todayRecord?.check_in || '--:--'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                        <p className="text-sm font-black text-slate-900">{todayRecord?.check_out || '--:--'}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10">
                <Timer className="w-10 h-10 mb-4 text-jeallo-orange" />
                <h4 className="text-lg font-black leading-tight mb-2">Auto-Log System</h4>
                <p className="text-xs font-bold opacity-70 leading-relaxed">Work hours are automatically calculated based on your check-out time.</p>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-jeallo-primary/10 rounded-xl flex items-center justify-center text-jeallo-primary">
                            <History className="w-5 h-5" />
                        </div>
                        Monthly Attendance History
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors border border-slate-100">
                            <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors border border-slate-100">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {isAdmin && <th className="px-6 pb-2">Employee</th>}
                                <th className="px-6 pb-2">Date</th>
                                <th className="px-6 pb-2">Check In</th>
                                <th className="px-6 pb-2">Check Out</th>
                                <th className="px-6 pb-2">Working Hours</th>
                                <th className="px-6 pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {historyData?.data.map((row) => (
                                <tr key={row.id} className="bg-white hover:bg-slate-50 transition-colors border border-slate-100 group">
                                    {isAdmin && (
                                        <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50 group-hover:border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-jeallo-primary/10 flex items-center justify-center text-jeallo-primary font-bold overflow-hidden shadow-sm">
                                                    {row.user?.avatar ? (
                                                        <img src={row.user.avatar} alt={row.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        row.user?.name ? row.user.name.charAt(0).toUpperCase() : '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm leading-none">{row.user?.name || 'Unknown User'}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 leading-none">{row.user?.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                    <td className={`px-6 py-5 border-y border-slate-50 group-hover:border-slate-100 ${!isAdmin ? 'rounded-l-2xl border-l' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{format(new Date(row.date), 'MMM')}</span>
                                                <span className="text-sm font-black text-slate-900 leading-none mt-1">{format(new Date(row.date), 'dd')}</span>
                                            </div>
                                            <span className="font-bold text-slate-600">{format(new Date(row.date), 'EEEE')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                                        <div className="flex items-center gap-2 font-bold text-slate-900">
                                            <ArrowUpRight className="w-3 h-3 text-done-green" />
                                            {row.check_in || '--:--'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                                        <div className="flex items-center gap-2 font-bold text-slate-900">
                                            <ArrowDownLeft className="w-3 h-3 text-red-500" />
                                            {row.check_out || '--:--'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 border-y border-slate-50 group-hover:border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-jeallo-primary h-full" style={{ width: `${Math.min((row.working_hours/9)*100, 100)}%` }}></div>
                                            </div>
                                            <span className="font-black text-sm text-slate-900">{row.working_hours}h</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-50 group-hover:border-slate-100 text-right">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                            row.status === 'present' ? 'bg-done-green/10 text-done-green' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400">Showing {historyData?.from}-{historyData?.to} of {historyData?.total} records</p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            disabled={!historyData?.next_page_url}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
