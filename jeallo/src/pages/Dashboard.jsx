import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import { 
  Calendar, CheckCircle2, Clock, Briefcase, 
  Users, TrendingUp, AlertCircle, Megaphone, 
  Video, ChevronRight, Plus, Star, Plane,
  ArrowUpRight, CalendarDays, ExternalLink,
  Sparkles, XCircle, Info, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveStats, setLeaveStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'casual',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Admin and Team Member management states
  const [teamMembers, setTeamMembers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewRemark, setReviewRemark] = useState('');
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  const isEmployee = user?.role === 'employee';

  const fetchData = async () => {
    if (!currentWorkspace) return;
    try {
      if (isEmployee) {
        const todayStr = new Date().toISOString().split('T')[0];
        const next30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [
          projectsResult,
          tasksResult,
          attendanceStatusResult,
          attendanceHistoryResult,
          leaveStatsResult,
          calendarEventsResult
        ] = await Promise.allSettled([
          api.get(`/v1/workspaces/${currentWorkspace.id}/projects`),
          api.get('/v1/tasks', { params: { workspace_id: currentWorkspace.id } }),
          api.get('/v1/attendance/status'),
          api.get('/v1/attendance'),
          api.get('/v1/leaves/stats'),
          api.get('/v1/calendar/events', { params: { start: todayStr, end: next30DaysStr } })
        ]);

        if (projectsResult.status === 'fulfilled') {
          setProjects(projectsResult.value.data.data || []);
        }
        if (tasksResult.status === 'fulfilled') {
          const rawTasks = tasksResult.value.data.data || [];
          const normalized = rawTasks.map(task => {
            let normalizedStatus = task.status;
            if (task.status) {
              const lower = task.status.toLowerCase().trim();
              if (['done', 'complete', 'completed', 'comlete', 'finished'].includes(lower)) {
                normalizedStatus = 'Done';
              }
            }
            return { ...task, status: normalizedStatus };
          });
          setRecentTasks(normalized);
        }
        if (attendanceStatusResult.status === 'fulfilled') {
          setAttendanceStatus(attendanceStatusResult.value.data);
        }
        if (attendanceHistoryResult.status === 'fulfilled') {
          setAttendanceHistory(attendanceHistoryResult.value.data.data || []);
        }
        if (leaveStatsResult.status === 'fulfilled') {
          setLeaveStats(leaveStatsResult.value.data);
        }
        if (calendarEventsResult.status === 'fulfilled') {
          const fetchedEvents = calendarEventsResult.value.data || [];
          const fetchedMeetings = fetchedEvents
            .filter(evt => evt.type === 'meeting')
            .map(evt => {
              const startTime = new Date(evt.start);
              return {
                id: evt.id,
                title: evt.title.replace(/^📹\s*/, ''),
                time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rawTime: startTime,
                duration: evt.end ? `${Math.round((new Date(evt.end) - startTime) / 60000)} min` : '45 min',
                type: evt.extendedProps?.location || 'Google Meet',
                link: evt.extendedProps?.link || ''
              };
            })
            .sort((a, b) => a.rawTime - b.rawTime);
          setMeetings(fetchedMeetings);
        }

        setStats({
          activity: [
            { name: 'Mon', tasks: 3 },
            { name: 'Tue', tasks: 5 },
            { name: 'Wed', tasks: 2 },
            { name: 'Thu', tasks: 6 },
            { name: 'Fri', tasks: 8 },
            { name: 'Sat', tasks: 0 },
            { name: 'Sun', tasks: 0 },
          ]
        });
      } else {
        const [
          projectsResult,
          tasksResult,
          usersResult,
          attendanceResult,
          leavesResult,
          leaveStatsResult
        ] = await Promise.allSettled([
          api.get(`/v1/workspaces/${currentWorkspace.id}/projects`),
          api.get('/v1/tasks', { params: { workspace_id: currentWorkspace.id } }),
          api.get('/v1/users'),
          api.get('/v1/attendance'),
          api.get('/v1/leaves'),
          api.get('/v1/leaves/stats')
        ]);

        if (projectsResult.status === 'fulfilled') {
          setProjects(projectsResult.value.data.data || []);
        }
        if (tasksResult.status === 'fulfilled') {
          const rawTasks = tasksResult.value.data.data || [];
          const normalized = rawTasks.map(task => {
            let normalizedStatus = task.status;
            if (task.status) {
              const lower = task.status.toLowerCase().trim();
              if (['done', 'complete', 'completed', 'comlete', 'finished'].includes(lower)) {
                normalizedStatus = 'Done';
              }
            }
            return { ...task, status: normalizedStatus };
          });
          setRecentTasks(normalized);
        }
        if (usersResult.status === 'fulfilled') {
          setTeamMembers(usersResult.value.data.data || []);
        }
        if (attendanceResult.status === 'fulfilled') {
          setAttendanceHistory(attendanceResult.value.data.data || []);
        }
        if (leavesResult.status === 'fulfilled') {
          setLeaveRequests(leavesResult.value.data.data || []);
        }
        if (leaveStatsResult.status === 'fulfilled') {
          setLeaveStats(leaveStatsResult.value.data);
        }

        setStats({
          activity: [
            { name: 'Mon', tasks: 12 },
            { name: 'Tue', tasks: 19 },
            { name: 'Wed', tasks: 15 },
            { name: 'Thu', tasks: 22 },
            { name: 'Fri', tasks: 30 },
            { name: 'Sat', tasks: 10 },
            { name: 'Sun', tasks: 8 },
          ]
        });
      }
    } catch (error) {
      console.error('Dashboard data fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWorkspace, isEmployee]);

  const handleCheckIn = async () => {
    try {
      const response = await api.post('/v1/attendance/check-in');
      toast.success(response.data.message || 'Checked in successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await api.post('/v1/attendance/check-out');
      toast.success(response.data.message || 'Checked out successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      await api.post('/v1/leaves', leaveForm);
      toast.success('Leave application submitted successfully!');
      setIsLeaveModalOpen(false);
      setLeaveForm({ type: 'casual', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const isCheckedIn = attendanceStatus?.is_checked_in;
  const isCheckedOut = attendanceStatus?.is_checked_out;
  const todayRecord = attendanceStatus?.attendance;

  const getMonthlyAttendanceStats = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthRecords = attendanceHistory.filter(record => {
      if (!record.date) return false;
      const d = new Date(record.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const presentDays = currentMonthRecords.filter(r => r.status === 'present').length;
    const totalWorkingHours = currentMonthRecords.reduce((sum, r) => sum + parseFloat(r.working_hours || 0), 0);

    return {
      presentDays,
      totalWorkingHours: totalWorkingHours.toFixed(1) + 'h'
    };
  };

  const monthlyStats = getMonthlyAttendanceStats();

  const getTaskPriorityData = () => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    recentTasks.forEach(task => {
      let priority = task.priority || 'Medium';
      priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
      if (counts[priority] !== undefined) {
        counts[priority] += 1;
      } else {
        counts.Medium += 1;
      }
    });
    return [
      { name: 'Low', count: counts.Low, color: '#94a3b8' },
      { name: 'Medium', count: counts.Medium, color: '#1B3A6B' },
      { name: 'High', count: counts.High, color: '#f97316' },
      { name: 'Critical', count: counts.Critical, color: '#ef4444' }
    ];
  };

  const taskPriorityData = getTaskPriorityData();

  // Admin Monthly Working Hours calculation
  const getAdminMonthlyAttendanceStats = () => {
    if (!attendanceHistory || attendanceHistory.length === 0) return '0.0h';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthRecords = attendanceHistory.filter(record => {
      if (!record.date) return false;
      const d = new Date(record.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const totalWorkingHours = currentMonthRecords.reduce((sum, r) => sum + parseFloat(r.working_hours || 0), 0);
    return totalWorkingHours.toFixed(1) + 'h';
  };

  // Admin Leave review/actions
  const handleLeaveAction = async (leaveId, status, remark) => {
    try {
      setProcessingLeaveId(leaveId);
      const response = await api.patch(`/v1/leaves/${leaveId}`, { 
        status: status, 
        admin_remark: remark 
      });
      toast.success(response.data.message || `Leave ${status} successfully!`);
      // Re-fetch data
      await fetchData();
      setSelectedLeave(null);
      setReviewRemark('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  if (isEmployee) {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-jeallo-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold text-sm tracking-wider uppercase">Syncing Dashboard...</p>
        </div>
      );
    }

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
        {/* Employee Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Hey, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
                It's a great day to be productive in <span className="text-jeallo-primary font-bold">{currentWorkspace?.name}</span>.
            </p>
          </div>
          
          {/* Quick Attendance Widget */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            {!isCheckedIn && !isCheckedOut && (
              <button 
                onClick={handleCheckIn}
                className="px-5 py-2.5 bg-jeallo-gradient text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-jeallo-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Clock className="w-4 h-4" />
                CLOCK IN
              </button>
            )}
            {isCheckedIn && (
              <>
                <div className="px-4 py-2 bg-done-green/10 text-done-green rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-done-green animate-pulse"></div>
                  <span className="text-xs font-black uppercase tracking-wider">Clocked In</span>
                </div>
                <button 
                  onClick={handleCheckOut}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  CLOCK OUT
                </button>
              </>
            )}
            {isCheckedOut && (
              <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">Shift Ended</span>
              </div>
            )}
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="px-4 text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Today's Hours</p>
              <p className="text-sm font-black text-slate-900">{todayRecord?.working_hours ? `${todayRecord.working_hours}h` : '--'}</p>
            </div>
          </div>
        </header>

        {/* Employee Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Present Days', value: monthlyStats.presentDays, icon: Calendar, color: 'bg-jeallo-primary', trend: 'This month' },
            { label: 'Leave Balance', value: leaveStats?.leave_balance ?? 0, icon: Star, color: 'bg-jeallo-orange', trend: `${leaveStats?.pending ?? 0} pending` },
            { label: 'My Tasks', value: recentTasks.length, icon: CheckCircle2, color: 'bg-done-green', trend: 'Active assignments' },
            { label: 'Work Hours', value: monthlyStats.totalWorkingHours, icon: Clock, color: 'bg-slate-900', trend: `From 1st of ${new Date().toLocaleString('default', { month: 'short' })}` },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                    <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className="w-7 h-7" />
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-end gap-3">
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                        <span className="text-[10px] font-bold text-slate-400 mb-1.5">{stat.trend}</span>
                    </div>
                </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Task Priority Distribution Chart */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Task Distribution</h3>
                        <p className="text-xs font-bold text-slate-400">Assigned task workload grouped by priority.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-jeallo-orange animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority Load</span>
                    </div>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskPriorityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                                cursor={{fill: '#f8fafc'}}
                            />
                            <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                                {taskPriorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Assigned Tasks */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Assignments</h3>
                    <Link to="/dashboard/my-tasks" className="text-xs font-black text-jeallo-primary hover:text-jeallo-orange transition-colors flex items-center gap-1 uppercase tracking-widest">
                        View Task Board <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="space-y-4">
                    {recentTasks.length > 0 ? recentTasks.map((task) => (
                        <div key={task.id} className="group flex items-center gap-6 p-6 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                task.priority === 'critical' || task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                            }`}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-900 group-hover:text-jeallo-primary transition-colors">{task.title}</h4>
                                <p className="text-xs font-bold text-slate-400 mt-1">Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'} • {task.project?.name || 'General'}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                    task.priority === 'critical' ? 'bg-red-500 text-white' : 
                                    task.priority === 'high' ? 'bg-orange-500 text-white' :
                                    task.priority === 'medium' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold">All clear! No pending tasks.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Right Sidebar Area */}
          <div className="space-y-8">
            {/* Upcoming Meetings */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute top-0 left-0 w-2 h-full bg-jeallo-orange"></div>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Video className="w-5 h-5 text-jeallo-orange animate-pulse" />
                    Upcoming Meetings
                </h3>
                <div className="space-y-6">
                    {meetings.length > 0 ? meetings.map((meeting) => (
                        <div key={meeting.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 before:rounded-full group hover:before:bg-jeallo-orange before:transition-all">
                            <p className="text-xs font-black text-jeallo-orange mb-1">{meeting.time}</p>
                            <h4 className="font-black text-slate-900 text-sm group-hover:text-jeallo-primary transition-colors">{meeting.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{meeting.duration} • <span className="capitalize">{meeting.type}</span></p>
                            {meeting.link && (
                                <a 
                                    href={meeting.link} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="inline-flex items-center gap-1 text-[10px] font-black text-jeallo-primary hover:text-jeallo-orange mt-2 bg-slate-50 px-2 py-1 rounded-md transition-colors border border-slate-100"
                                >
                                    Join Meeting <ArrowUpRight className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Video className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold text-xs">No upcoming meetings</p>
                        </div>
                    )}
                </div>
                <Link to="/dashboard/calendar" className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    <Calendar className="w-4 h-4" />
                    Open Calendar
                </Link>
            </div>

            {/* Announcements / Updates */}
            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-jeallo-primary" />
                    Workspace Updates
                </h3>
                <div className="space-y-6">
                    {[
                        { title: 'New Office Policy', date: 'Oct 12', summary: 'Please read the updated WFH guidelines.', tag: 'Policy' },
                        { title: 'Quarterly Bonus', date: 'Oct 10', summary: 'Q3 performance bonuses have been processed.', tag: 'Finance' }
                    ].map((ann, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-jeallo-primary bg-white px-2 py-0.5 rounded-md border border-slate-200">{ann.tag}</span>
                                <span className="text-[10px] font-bold text-slate-400">{ann.date}</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{ann.title}</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{ann.summary}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leave Request Card Widget */}
            <div className="bg-jeallo-primary p-8 rounded-[3rem] text-white shadow-xl shadow-jeallo-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <AlertCircle className="w-8 h-8 mb-4 text-jeallo-orange" />
                <h4 className="text-lg font-black leading-tight">Need Time Off?</h4>
                <p className="text-xs font-medium opacity-60 mt-2 mb-6">Request leaves and track your approval status in real-time.</p>
                <button 
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full py-3 bg-white text-jeallo-primary rounded-xl text-xs font-black hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                >
                    Request Leave
                </button>
            </div>
          </div>
        </div>

        {/* Leave Request Modal */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 max-w-md w-full relative overflow-hidden animate-in slide-in-from-bottom duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-jeallo-primary/5 rounded-bl-full -mr-12 -mt-12"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Plane className="w-6 h-6 text-jeallo-orange" />
                  Apply for Leave
                </h3>
                <button 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold transition-all text-sm bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Leave Balance</p>
                  <p className="text-lg font-black text-slate-900">{leaveStats?.leave_balance ?? 0} Days</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Requests</p>
                  <p className="text-lg font-black text-slate-900">{leaveStats?.pending ?? 0}</p>
                </div>
              </div>

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
                  <select 
                    required
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-jeallo-primary transition-all"
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={leaveForm.start_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-jeallo-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                    <input 
                      type="date"
                      required
                      value={leaveForm.end_date}
                      onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-jeallo-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Reason</label>
                  <textarea 
                    required
                    rows="3"
                    placeholder="Explain why you need time off..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-jeallo-primary transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={submittingLeave}
                  className="w-full bg-jeallo-gradient text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submittingLeave ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

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

  // Admin / Manager Dashboard (Redesigned & Fully Working)
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-jeallo-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-jeallo-orange/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse delay-1000"></div>

      {/* Admin Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-jeallo-primary/10 text-jeallo-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ADMIN CONSOLE
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 👑
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            Managing operations and team performance in <span className="text-jeallo-primary font-bold">{currentWorkspace?.name}</span>.
          </p>
        </div>
        
        {/* Quick Action Buttons - Highly practical admin tools, zero check-in / check-out */}
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            to="/dashboard/calendar" 
            className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Calendar className="w-4 h-4 text-jeallo-orange" />
            OPEN CALENDAR
          </Link>
          <Link
            to="/dashboard/users"
            className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            ADD EMPLOYEE
          </Link>
        </div>
      </header>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'bg-jeallo-primary', trend: `${projects.length} Total` },
          { label: 'Pending Tasks', value: recentTasks.filter(t => t.status !== 'Done').length, icon: CheckCircle2, color: 'bg-jeallo-orange', trend: 'Across workspace' },
          { label: 'Team Size', value: teamMembers.length, icon: Users, color: 'bg-done-green', trend: 'Active members' },
          { label: 'Total Hours Logged', value: getAdminMonthlyAttendanceStats(), icon: Clock, color: 'bg-slate-900', trend: `This Month (${new Date().toLocaleString('default', { month: 'short' })})` },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                  <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="w-7 h-7" />
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                      <span className="text-[10px] font-bold text-slate-400 mb-1.5">{stat.trend}</span>
                  </div>
              </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left main area (Col Span 2) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Task Load Distribution Chart */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Team Task Distribution</h3>
                      <p className="text-xs font-bold text-slate-400">Total workspace tasks grouped by priority.</p>
                  </div>
                  <div className="flex gap-2 animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-jeallo-orange"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Load</span>
                  </div>
              </div>
              <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taskPriorityData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                          <Tooltip 
                              contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                              cursor={{fill: '#f8fafc'}}
                          />
                          <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={45}>
                              {taskPriorityData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Active Projects Tracker */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Projects</h3>
                <p className="text-xs font-bold text-slate-400">Track and manage your workspace projects.</p>
              </div>
              <Link to="/dashboard/projects" className="text-xs font-black text-jeallo-primary hover:text-jeallo-orange transition-colors flex items-center gap-1 uppercase tracking-widest">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length > 0 ? projects.slice(0, 4).map((project) => {
                const projectTasks = recentTasks.filter(t => t.project_id === project.id);
                const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
                const totalTasks = projectTasks.length;
                const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
                return (
                  <Link 
                    key={project.id}
                    to={`/dashboard/projects/${project.id}/board`}
                    className="flex flex-col p-6 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all border border-slate-100 hover:border-jeallo-primary/20 hover:shadow-md group"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all shrink-0" style={{ backgroundColor: project.color || '#1B3A6B' }}>
                        {project.name[0]}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-black text-slate-900 truncate group-hover:text-jeallo-primary transition-colors">{project.name}</h4>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'} • {completedTasks} Done
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-700">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-done-green h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div className="text-center py-10 col-span-2">
                    <p className="text-slate-400 font-bold">No active projects found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Tasks</h3>
                    <p className="text-xs font-bold text-slate-400">Latest active assignments across the workspace.</p>
                  </div>
                  <Link to="/dashboard/tasks" className="text-xs font-black text-jeallo-primary hover:text-jeallo-orange transition-colors flex items-center gap-1 uppercase tracking-widest">
                      View Task Board <ChevronRight className="w-4 h-4" />
                  </Link>
              </div>
              <div className="space-y-4">
                  {recentTasks.length > 0 ? recentTasks.slice(0, 5).map((task) => {
                    const project = projects.find(p => p.id === task.project_id);
                    const projectName = project ? project.name : 'General';
                    const assignee = task.assignees?.[0];
                    
                    return (
                      <div key={task.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                  task.priority === 'critical' || task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                              }`}>
                                  <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                  <h4 className="font-black text-slate-900 group-hover:text-jeallo-primary transition-colors truncate">{task.title}</h4>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs font-bold text-slate-400">
                                      <span>Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}</span>
                                      <span>•</span>
                                      <span className="text-slate-500 font-bold">{projectName}</span>
                                      {assignee && (
                                        <>
                                          <span>•</span>
                                          <span className="text-slate-950 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                                            {assignee.avatar ? (
                                              <img src={assignee.avatar} alt={assignee.name} className="w-3.5 h-3.5 rounded-full object-cover animate-in fade-in" />
                                            ) : (
                                              <span className="w-3.5 h-3.5 rounded-full bg-jeallo-primary text-white text-[8px] font-black flex items-center justify-center">{assignee.name[0]}</span>
                                            )}
                                            {assignee.name}
                                          </span>
                                        </>
                                      )}
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-3 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md shrink-0 ${
                                  task.status === 'Done' ? 'bg-done-green/10 text-done-green border border-done-green/20' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                              }`}>
                                  {task.status}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                                  task.priority === 'critical' ? 'bg-red-500 text-white shadow-sm shadow-red-500/20' : 
                                  task.priority === 'high' ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' :
                                  task.priority === 'medium' ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                              }`}>
                                  {task.priority}
                              </span>
                          </div>
                      </div>
                    );
                  }) : (
                      <div className="text-center py-10">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className="text-slate-400 font-bold">No tasks in this workspace.</p>
                      </div>
                  )}
              </div>
          </div>
        </div>

        {/* Right Sidebar Area (Col Span 1) */}
        <div className="space-y-8">
          
          {/* Interactive Pending Leaves Widget */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 w-2 h-full bg-jeallo-orange"></div>
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Plane className="w-5 h-5 text-jeallo-orange animate-pulse" />
                      Pending Leaves
                  </h3>
                  <span className="text-[10px] font-black bg-jeallo-orange/10 text-jeallo-orange px-2.5 py-1 rounded-full">
                    {leaveRequests.filter(l => l.status === 'pending').length} Actions
                  </span>
              </div>
              
              <div className="space-y-4">
                  {leaveRequests.filter(l => l.status === 'pending').length > 0 ? (
                    leaveRequests.filter(l => l.status === 'pending').slice(0, 3).map((leave) => (
                      <div key={leave.id} className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs shrink-0 border border-slate-300">
                            {leave.user?.avatar ? (
                              <img src={leave.user.avatar} alt={leave.user.name} className="w-full h-full object-cover" />
                            ) : (
                              leave.user?.name?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-xs leading-none mb-1">{leave.user?.name || 'Employee'}</h4>
                            <p className="text-[9px] font-bold text-slate-400 capitalize">{leave.type} leave • {leave.days} {leave.days === 1 ? 'day' : 'days'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 italic">"{leave.reason}"</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleLeaveAction(leave.id, 'rejected', 'Declined via Admin Dashboard')}
                            disabled={processingLeaveId === leave.id}
                            className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-black rounded-xl active:scale-95 transition-all border border-red-100"
                          >
                            DECLINE
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave.id, 'approved', 'Approved via Admin Dashboard')}
                            disabled={processingLeaveId === leave.id}
                            className="flex-1 py-2 bg-jeallo-gradient text-white text-[10px] font-black rounded-xl active:scale-95 transition-all shadow-md shadow-jeallo-primary/10"
                          >
                            APPROVE
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setReviewRemark('');
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black rounded-xl active:scale-95 transition-all"
                          >
                            DETAIL
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                      <div className="text-center py-8">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Plane className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold text-xs">No pending leave requests</p>
                      </div>
                  )}
              </div>
              
              <Link to="/dashboard/leaves" className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                  <Plane className="w-4 h-4" />
                  Review All Leaves
              </Link>
          </div>

          {/* Dynamic Operations Feed (Real-Time Attendance History) */}
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-jeallo-primary" />
                  Operations Feed
              </h3>
              <div className="space-y-6 flex-1 max-h-[350px] overflow-y-auto pr-2 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {attendanceHistory.length > 0 ? (
                    attendanceHistory.slice(0, 4).map((record, i) => {
                      const userName = record.user?.name || 'Employee';
                      const firstInitial = userName[0].toUpperCase();
                      
                      let feedText = '';
                      let feedTime = '';
                      let feedColor = 'bg-jeallo-primary';
                      
                      if (record.check_in && !record.check_out) {
                        feedText = `clocked in to start their shift`;
                        feedTime = record.check_in;
                        feedColor = 'bg-done-green';
                      } else if (record.check_in && record.check_out) {
                        feedText = `completed an active shift of ${record.working_hours} hours`;
                        feedTime = record.check_out;
                        feedColor = 'bg-jeallo-primary';
                      } else {
                        feedText = `was marked ${record.status || 'present'}`;
                        feedTime = record.date ? new Date(record.date).toLocaleDateString() : '';
                        feedColor = 'bg-slate-400';
                      }

                      return (
                        <div key={i} className="flex gap-4 relative z-10 animate-in slide-in-from-bottom duration-300">
                          <div className={`w-10 h-10 rounded-full border-4 border-slate-50 shrink-0 flex items-center justify-center text-white font-black text-xs ${feedColor}`}>
                            {firstInitial}
                          </div>
                          <div className="pt-1">
                            <p className="text-xs text-slate-600 font-medium">
                              <span className="font-black text-slate-950">{userName}</span> {feedText}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-300" />
                              {record.date ? new Date(record.date).toLocaleDateString([], {month: 'short', day: 'numeric'}) : ''} {feedTime ? `• ${feedTime}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 font-bold text-xs">No recent attendance records</p>
                    </div>
                  )}
              </div>
              <Link to="/dashboard/attendance" className="w-full mt-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <Clock className="w-4 h-4 text-jeallo-primary" />
                  Attendance Records
              </Link>
          </div>
        </div>
      </div>

      {/* Admin Review Leave Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedLeave(null)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Leave Request</h2>
                  <button 
                    onClick={() => setSelectedLeave(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold transition-all text-sm bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-100"
                  >
                    ✕
                  </button>
                </div>
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
                      {new Date(selectedLeave.start_date).toLocaleDateString()} - {new Date(selectedLeave.end_date).toLocaleDateString()}
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
                    placeholder="Add any notes or specific reasons for decision..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-medium text-slate-700 focus:ring-2 focus:ring-jeallo-primary/20 resize-none text-sm"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleLeaveAction(selectedLeave.id, 'rejected', reviewRemark)}
                    disabled={processingLeaveId === selectedLeave.id}
                    className="flex-1 bg-red-50 text-red-500 py-4.5 rounded-2xl font-black text-base hover:bg-red-100 transition-all active:scale-95 text-center flex items-center justify-center gap-2 border border-red-100"
                  >
                    <XCircle className="w-5 h-5" />
                    DECLINE
                  </button>
                  <button 
                    onClick={() => handleLeaveAction(selectedLeave.id, 'approved', reviewRemark)}
                    disabled={processingLeaveId === selectedLeave.id}
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
