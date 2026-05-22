import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Calendar, CheckCircle2, Clock, Briefcase, 
  Users, TrendingUp, AlertCircle, Megaphone, 
  Video, ChevronRight, Plus, Star
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    if (currentWorkspace) {
      const fetchData = async () => {
        try {
          const [projectsResult, tasksResult] = await Promise.allSettled([
            api.get(`/v1/workspaces/${currentWorkspace.id}/projects`),
            api.get('/v1/tasks', { params: { workspace_id: currentWorkspace.id } })
          ]);

          let fetchedProjects = [];
          if (projectsResult.status === 'fulfilled') {
            fetchedProjects = projectsResult.value.data.data;
            setProjects(fetchedProjects);
          } else {
            console.error('Failed to fetch projects', projectsResult.reason);
          }

          let fetchedTasks = [];
          if (tasksResult.status === 'fulfilled') {
            const rawTasks = tasksResult.value.data.data;
            fetchedTasks = (rawTasks || []).map(task => {
              let normalizedStatus = task.status;
              if (task.status) {
                const lower = task.status.toLowerCase().trim();
                if (['done', 'complete', 'completed', 'comlete', 'finished'].includes(lower)) {
                  normalizedStatus = 'Done';
                }
              }
              return {
                ...task,
                status: normalizedStatus
              };
            });
            setRecentTasks(fetchedTasks.slice(0, 5));
          } else {
            console.error('Failed to fetch tasks', tasksResult.reason);
          }
          
          // Dummy data for premium visualization
          setStats({
            activity: [
              { name: 'Mon', tasks: 12 },
              { name: 'Tue', tasks: 19 },
              { name: 'Wed', tasks: 15 },
              { name: 'Thu', tasks: 22 },
              { name: 'Fri', tasks: 30 },
              { name: 'Sat', tasks: 10 },
              { name: 'Sun', tasks: 8 },
            ],
            employeeStats: {
                presentDays: 22,
                pendingLeaves: 1,
                tasksAssigned: fetchedTasks.length,
                leaveBalance: 12
            }
          });
        } catch (error) {
          console.error('Dashboard data fetch failed', error);
        }
      };
      fetchData();
    }
  }, [currentWorkspace]);

  if (isEmployee) {
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
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-4 py-2 bg-done-green/10 text-done-green rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-done-green animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-wider">Clocked In</span>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="px-4 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Shift Time</p>
                <p className="text-sm font-black text-slate-900">09:00 - 18:00</p>
            </div>
          </div>
        </header>

        {/* Employee Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Present Days', value: stats?.employeeStats?.presentDays || 0, icon: Calendar, color: 'bg-jeallo-primary', trend: '+2 this month' },
            { label: 'Leave Balance', value: stats?.employeeStats?.leaveBalance || 0, icon: Star, color: 'bg-jeallo-orange', trend: '1 pending' },
            { label: 'My Tasks', value: stats?.employeeStats?.tasksAssigned || 0, icon: CheckCircle2, color: 'bg-done-green', trend: '3 due today' },
            { label: 'Work Hours', value: '168h', icon: Clock, color: 'bg-slate-900', trend: 'This month' },
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
            {/* My Performance Chart */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Weekly Focus</h3>
                        <p className="text-xs font-bold text-slate-400">Task completion trends over the last 7 days.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-jeallo-primary"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completed</span>
                    </div>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.activity || []}>
                            <defs>
                                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                                cursor={{stroke: '#1B3A6B', strokeWidth: 2}}
                            />
                            <Area type="monotone" dataKey="tasks" stroke="#1B3A6B" strokeWidth={4} fillOpacity={1} fill="url(#colorTasks)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Assigned Tasks */}
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
                                <p className="text-xs font-bold text-slate-400 mt-1">Due {task.due_date || 'No deadline'} • {task.project?.name || 'General'}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                    task.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'
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
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-jeallo-orange"></div>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Video className="w-5 h-5 text-jeallo-orange" />
                    Meetings
                </h3>
                <div className="space-y-6">
                    {[
                        { title: 'Project Sync', time: '10:30 AM', duration: '45 min', type: 'Zoom' },
                        { title: 'Sprint Planning', time: '02:00 PM', duration: '1h', type: 'Google Meet' }
                    ].map((meeting, i) => (
                        <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 before:rounded-full">
                            <p className="text-xs font-black text-jeallo-orange mb-1">{meeting.time}</p>
                            <h4 className="font-black text-slate-900 text-sm">{meeting.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{meeting.duration} • {meeting.type}</p>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                    <Plus className="w-4 h-4" />
                    Schedule One
                </button>
            </div>

            {/* Announcements */}
            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-jeallo-primary" />
                    Updates
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

            {/* Quick Action */}
            <div className="bg-jeallo-primary p-8 rounded-[3rem] text-white shadow-xl shadow-jeallo-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <AlertCircle className="w-8 h-8 mb-4 text-jeallo-orange" />
                <h4 className="text-lg font-black leading-tight">Need Time Off?</h4>
                <p className="text-xs font-medium opacity-60 mt-2 mb-6">Request leaves and track your approval status in real-time.</p>
                <button className="w-full py-3 bg-white text-jeallo-primary rounded-xl text-xs font-black hover:bg-slate-50 transition-all">
                    Request Leave
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin / Manager Dashboard (Original)
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-jeallo-primary tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 🚀</h1>
          <p className="text-slate-500 font-medium">Here's what's happening in <span className="text-jeallo-orange font-bold italic"> {currentWorkspace?.name}</span> today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-jeallo-primary to-jeallo-orange text-white rounded-xl font-bold hover:shadow-xl hover:shadow-jeallo-primary/20 hover:scale-105 transition-all flex items-center gap-2 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Create New
          </button>
        </div>
      </header>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', value: projects.length, icon: Briefcase, color: 'bg-jeallo-primary' },
          { label: 'Pending Tasks', value: recentTasks.length, icon: CheckCircle2, color: 'bg-deadline-amber' },
          { label: 'Team Members', value: 14, icon: Users, color: 'bg-done-green' },
          { label: 'Time Logged', value: '124h', icon: Clock, color: 'bg-overdue-red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-done-green bg-done-green/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-jeallo-primary">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-jeallo-primary tracking-tight">Activity Overview</h3>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-500 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.activity || []}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                  cursor={{stroke: '#1B3A6B', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="tasks" stroke="#1B3A6B" strokeWidth={4} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-jeallo-primary tracking-tight">My Projects</h3>
            <Link to="/dashboard/projects" className="text-jeallo-orange font-bold text-sm hover:underline transition-all">View All</Link>
          </div>
          <div className="space-y-4 flex-1">
            {projects.slice(0, 4).map((project) => (
              <Link 
                key={project.id}
                to={`/dashboard/projects/${project.id}/board`}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:rotate-6 transition-transform" style={{ backgroundColor: project.color }}>
                  {project.name[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-jeallo-primary truncate">{project.name}</h4>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-done-green h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-jeallo-orange/10 text-jeallo-primary font-bold rounded-xl hover:bg-jeallo-orange/20 transition-all">
            + New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-jeallo-primary mb-6 tracking-tight">Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-slate-50 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  task.priority === 'critical' ? 'bg-overdue-red/10 text-overdue-red' : 'bg-slate-100 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-jeallo-primary truncate group-hover:text-jeallo-orange transition-colors">{task.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">In {task.status} • {task.type}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    task.priority === 'high' || task.priority === 'critical' ? 'bg-overdue-red/10 text-overdue-red' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Activity Feed */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-jeallo-primary mb-6 tracking-tight">Team Activity</h3>
          <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {[
              { user: 'Manager 1', action: 'moved task', target: 'Finalize API Spec', time: '2h ago', color: 'bg-done-green' },
              { user: 'Employee 3', action: 'commented on', target: 'User Authentication', time: '4h ago', color: 'bg-jeallo-navy' },
              { user: 'Admin', action: 'started sprint', target: 'Sprint 2', time: 'Yesterday', color: 'bg-deadline-amber' },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className={`w-10 h-10 rounded-full border-4 border-white z-10 flex items-center justify-center text-white ${act.color}`}>
                  {act.user[0]}
                </div>
                <div className="pt-1">
                  <p className="text-sm text-slate-600 font-medium">
                    <span className="font-black text-jeallo-primary">{act.user}</span> {act.action} <span className="font-bold text-slate-900 underline decoration-jeallo-orange/30">{act.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-bold mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
