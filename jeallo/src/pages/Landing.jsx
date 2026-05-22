import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  CheckCircle2, 
  BarChart3, 
  Zap, 
  Users, 
  ArrowRight,
  Layout,
  Clock,
  ShieldCheck,
  Rocket,
  Sparkles,
  Laptop,
  ChevronRight,
  Info,
  Shield,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import leftIllustration from '../assets/auth/left.png';
import rightIllustration from '../assets/auth/right.png';

const featuresList = [
  {
    id: 'kanban',
    category: 'Workspace',
    title: 'Visual Kanban Boards',
    icon: Layout,
    description: 'Visualize workflows with an industry-leading drag-and-drop board column system.',
    details: 'Our visual boards allow you to divide project workflows into custom lists (e.g. To Do, In Progress, Completed), drag-and-drop tasks, set milestones, assign team members, and track progress interactively in real-time. Boost collaboration with frictionless task handoffs.'
  },
  {
    id: 'attendance',
    category: 'Attendance',
    title: 'Shift Attendance Tracker',
    icon: Clock,
    description: 'Frictionless daily clock-in/out features mapping monthly hours with zero effort.',
    details: 'Log shift states with a simple, high-visibility quick widget. Employees check in and out from their dashboard, automatically computing decimal working hours. The system aggregates logs starting from the 1st of each month to maintain a highly precise work record.'
  },
  {
    id: 'analytics',
    category: 'Analytics',
    title: 'Real-Time Analytics',
    icon: BarChart3,
    description: 'Deep dive into active system loads using precise priority load distribution charts.',
    details: 'Track task priorities dynamically with robust analytics. The system groups task backlogs into Low, Medium, High, and Critical levels and compiles graphical charts, allowing managers to monitor workspace loads and resolve delivery bottlenecks immediately.'
  },
  {
    id: 'leaves',
    category: 'Operations',
    title: 'Team Leave Verification',
    icon: Users,
    description: 'Instant administrative approval and decline actions complete with custom feedback remarks.',
    details: 'Streamline time-off requests. Employees apply for leaves directly from their dashboard with live balance counters. Workspace administrators and managers receive instant notifications in their review panel to approve, decline, or input remarks in seconds.'
  },
  {
    id: 'tasks',
    category: 'Tasks',
    title: 'Dynamic Task Routing',
    icon: CheckCircle2,
    description: 'Assign ownership, configure target dates, and review backlog updates on a unified workspace.',
    details: 'Configure milestones, specify due dates, and track assignees seamlessly. Our backend automatically routes individual task cards into personal queues and aggregates active workloads for simple workspace management.'
  },
  {
    id: 'security',
    category: 'Security',
    title: 'Granular Role Controls',
    icon: ShieldCheck,
    description: 'Hardened security mapping secure separate portals for managers, administrators, and employees.',
    details: 'Jeallo secures your corporate data using standard Role-Based Access Control (RBAC). Passwords are encrypted with Bcrypt, API handshakes utilize secure Sanctum tokens, and routing rules enforce strict access permission grids at every level.'
  }
];

const FeatureCard = ({ item, onClick }) => {
  const Icon = item.icon;
  return (
    <button 
      onClick={() => onClick(item)}
      className="p-8 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_8px_24px_rgba(149,157,165,0.04)] hover:shadow-[0_16px_36px_rgba(149,157,165,0.08)] hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden flex flex-col items-start w-full text-left"
    >
      <div className="flex justify-between items-center w-full mb-6">
        <div className="w-12 h-12 bg-jeallo-gradient text-white rounded-xl flex items-center justify-center shadow-md shadow-jeallo-primary/10 group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-400 rounded-md">
          {item.category}
        </span>
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight flex items-center gap-1">
        {item.title}
        <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-jeallo-primary transition-all shrink-0" />
      </h3>
      <p className="text-slate-500 leading-relaxed text-xs font-medium">{item.description}</p>
    </button>
  );
};

export default function Landing() {
  const { token } = useAuthStore();
  const [selectedFeature, setSelectedFeature] = useState(null);
  // Tab states: 'about' | 'privacy' | 'security' | 'help' | null
  const [activeInfoTab, setActiveInfoTab] = useState(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  // Simulator active tab inside mockup: 'kanban' | 'attendance' | 'leaves'
  const [mockActiveTab, setMockActiveTab] = useState('kanban');
  
  // Kanban task status stage: 'todo' | 'progress' | 'done'
  const [mockKanbanState, setMockKanbanState] = useState('todo');
  
  // Attendance shift state: 'offline' | 'checked_in' | 'checked_out'
  const [mockAttendanceState, setMockAttendanceState] = useState('offline');
  
  // Leaves approval lists simulation
  const [mockLeavesList, setMockLeavesList] = useState([
    { id: 1, name: 'Sarah Connor', type: 'Maternity Leave', range: 'May 28 - Jun 15', status: 'pending', reason: 'Family expansion and care' },
    { id: 2, name: 'Marcus Wright', type: 'Casual Leave', range: 'Today', status: 'pending', reason: 'Routine medical appointment' },
    { id: 3, name: 'Kyle Reese', type: 'Annual Paid Leave', range: 'Jun 10 - Jun 18', status: 'pending', reason: 'Scheduled summer vacation' }
  ]);

  const handleActionLeave = (id, newStatus) => {
    setMockLeavesList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleResetLeaves = () => {
    setMockLeavesList(prev => prev.map(item => ({ ...item, status: 'pending' })));
  };

  const toggleFaq = (index) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  const getTabTitle = () => {
    switch (activeInfoTab) {
      case 'about': return 'About Jeallo';
      case 'privacy': return 'Privacy Policy';
      case 'security': return 'Security Standards';
      case 'help': return 'Help Center & FAQ';
      default: return '';
    }
  };

  const getTabIcon = () => {
    switch (activeInfoTab) {
      case 'about': return <Info className="w-6 h-6 text-jeallo-primary" />;
      case 'privacy': return <ShieldCheck className="w-6 h-6 text-jeallo-primary" />;
      case 'security': return <Shield className="w-6 h-6 text-jeallo-primary" />;
      case 'help': return <HelpCircle className="w-6 h-6 text-jeallo-primary" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 overflow-x-hidden font-sans selection:bg-jeallo-primary/10 flex flex-col relative">
      {/* Background Side Illustrations matching the Login design */}
      <div className="hidden lg:block absolute left-0 bottom-0 w-[20%] max-w-[280px] p-6 opacity-85 z-0 pointer-events-none animate-in slide-in-from-left-10 duration-700">
        <img src={leftIllustration} alt="Collaboration" className="w-full h-auto" />
      </div>
      <div className="hidden lg:block absolute right-0 bottom-0 w-[20%] max-w-[280px] p-6 opacity-85 z-0 pointer-events-none animate-in slide-in-from-right-10 duration-700">
        <img src={rightIllustration} alt="Productivity" className="w-full h-auto" />
      </div>

      {/* Navbar - Sharp & Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/85">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-jeallo-gradient rounded-lg flex items-center justify-center shadow-lg shadow-jeallo-primary/20">
              <Target className="text-white w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-black text-slate-850 tracking-tighter uppercase">Jeallo</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-jeallo-primary transition-colors">Features</a>
            <a href="#preview" className="hover:text-jeallo-primary transition-colors">Workspace</a>
            <button onClick={() => { setActiveInfoTab('about'); }} className="hover:text-jeallo-primary uppercase transition-colors outline-none">About Us</button>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"} 
              className="text-xs font-black text-white bg-jeallo-primary hover:bg-jeallo-primary/95 px-6 py-2.5 rounded-md transition-all shadow-md shadow-jeallo-primary/10 hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
              {token ? "Dashboard" : "Log In"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-6 z-10 flex-1 flex flex-col justify-center items-center">
        <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Decorative Tag */}
          <div className="inline-flex items-center gap-1.5 bg-jeallo-primary/5 text-jeallo-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-jeallo-primary/10">
            <Rocket className="w-3.5 h-3.5 text-jeallo-primary" />
            Workforce Management Redefined
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Master your tasks with <br />
            <span className="text-jeallo-primary">unmatched</span> speed.
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Jeallo combines the structure of enterprise planning with the simplicity of visual boards. 
            The unified platform your team needs to collaborate, log attendance, and ship results.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2">
            <Link 
              to={token ? "/dashboard" : "/login"} 
              className="w-full sm:w-auto bg-jeallo-primary hover:bg-jeallo-primary/95 text-white px-8 py-3.5 rounded-md font-black text-sm transition-all shadow-md shadow-jeallo-primary/15 flex items-center justify-center gap-2 uppercase tracking-wider hover:scale-[1.02] active:scale-95"
            >
              Launch Platform
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#preview"
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 px-8 py-3.5 rounded-md font-black text-sm transition-all flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 uppercase tracking-wider"
            >
              Explore Workspace
            </a>
          </div>

          {/* Interactive CSS App Simulator Preview instead of static content */}
          <div id="preview" className="pt-12 pb-8 max-w-4xl mx-auto w-full px-4 relative">
            {/* Ambient Background Gradient Meshes for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-jeallo-primary/8 via-orange-500/4 to-amber-500/2 blur-3xl -z-10 rounded-full pointer-events-none"></div>

            <div className="bg-white rounded-[2rem] border border-slate-150 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300">
              {/* Browser Header Bar */}
              <div className="bg-slate-50/80 border-b border-slate-150 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg py-1 px-8 md:px-16 text-[10px] font-black text-slate-400 flex items-center gap-2 shadow-sm uppercase tracking-wider select-none">
                  <Laptop className="w-3.5 h-3.5 text-slate-350" />
                  demo.jeallo.com/workspace
                </div>
                <div className="w-8"></div>
              </div>

              {/* Simulated Workspace Application Container */}
              <div className="flex flex-col md:flex-row min-h-[420px] text-left">
                {/* Simulated Workspace Left Sidebar Panel */}
                <div className="w-full md:w-56 bg-slate-50 border-r border-slate-150 p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible">
                  <div className="hidden md:block pb-4 mb-2 border-b border-slate-200/80 px-2">
                    <span className="text-[10px] font-black uppercase text-slate-450 tracking-[0.2em]">Live Sandbox</span>
                  </div>

                  <button
                    onClick={() => setMockActiveTab('kanban')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all w-full shrink-0 select-none ${
                      mockActiveTab === 'kanban' 
                        ? 'bg-jeallo-gradient text-white shadow-md shadow-jeallo-primary/10' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Layout className="w-4 h-4 shrink-0" />
                    <span>Visual Kanban</span>
                  </button>

                  <button
                    onClick={() => setMockActiveTab('attendance')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all w-full shrink-0 select-none ${
                      mockActiveTab === 'attendance' 
                        ? 'bg-jeallo-gradient text-white shadow-md shadow-jeallo-primary/10' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Shift Tracker</span>
                  </button>

                  <button
                    onClick={() => setMockActiveTab('leaves')}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all w-full shrink-0 select-none ${
                      mockActiveTab === 'leaves' 
                        ? 'bg-jeallo-gradient text-white shadow-md shadow-jeallo-primary/10' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Leave Review</span>
                  </button>
                </div>

                {/* Simulated Main Viewport */}
                <div className="flex-1 p-6 bg-slate-50/15 flex flex-col justify-between">
                  {/* TAB CONTENT: KANBAN BOARD */}
                  {mockActiveTab === 'kanban' && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kanban Column View</span>
                          <span className="text-[10px] font-black text-jeallo-primary uppercase tracking-wider bg-jeallo-primary/5 px-2.5 py-0.5 rounded border border-jeallo-primary/10 animate-pulse">Interactive Sandbox</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {/* Column: To Do */}
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 min-h-[160px] flex flex-col gap-2">
                            <div className="flex justify-between items-center pb-1 border-b border-slate-100/80 mb-1">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">To Do</span>
                              <span className="w-4 h-4 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black flex items-center justify-center">
                                {mockKanbanState === 'todo' ? 1 : 0}
                              </span>
                            </div>
                            
                            {mockKanbanState === 'todo' && (
                              <div className="p-3 bg-white border border-slate-150 rounded-lg space-y-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded border border-rose-100 tracking-wide">High Priority</span>
                                <p className="text-[10px] font-black text-slate-800 leading-tight">Revamp login validation and authentication widgets</p>
                                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[8px] text-slate-400 font-bold">
                                  <span>May 25</span>
                                  <div className="w-4 h-4 rounded-full bg-jeallo-primary text-white text-[6px] font-bold flex items-center justify-center">DJ</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Column: In Progress */}
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 min-h-[160px] flex flex-col gap-2">
                            <div className="flex justify-between items-center pb-1 border-b border-slate-100/80 mb-1">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">In Progress</span>
                              <span className="w-4 h-4 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black flex items-center justify-center">
                                {mockKanbanState === 'progress' ? 1 : 0}
                              </span>
                            </div>
                            
                            {mockKanbanState === 'progress' && (
                              <div className="p-3 bg-white border border-jeallo-primary/20 rounded-lg space-y-2 shadow-md shadow-jeallo-primary/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-purple-50 text-purple-500 rounded border border-purple-100 tracking-wide">Active Dev</span>
                                <p className="text-[10px] font-black text-slate-800 leading-tight">Revamp login validation and authentication widgets</p>
                                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[8px] text-slate-400 font-bold">
                                  <span>Today</span>
                                  <div className="w-4 h-4 rounded-full bg-jeallo-primary text-white text-[6px] font-bold flex items-center justify-center">DJ</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Column: Done */}
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150 min-h-[160px] flex flex-col gap-2">
                            <div className="flex justify-between items-center pb-1 border-b border-slate-100/80 mb-1">
                              <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Completed</span>
                              <span className="w-4 h-4 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black flex items-center justify-center">
                                {mockKanbanState === 'done' ? 1 : 0}
                              </span>
                            </div>
                            
                            {mockKanbanState === 'done' && (
                              <div className="p-3 bg-emerald-50/10 border border-emerald-250 rounded-lg space-y-2 shadow-sm opacity-90 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-650 rounded border border-emerald-100 tracking-wide">Verified</span>
                                <p className="text-[10px] font-black text-slate-800 leading-tight line-through">Revamp login validation and authentication widgets</p>
                                <div className="flex justify-between items-center pt-1.5 border-t border-emerald-100/60 text-[8px] text-emerald-600 font-bold flex gap-1 items-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Completed</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div className="text-xs text-slate-500 font-medium leading-tight text-center sm:text-left">
                          <p className="font-bold text-slate-700">Watch the board transition in real-time.</p>
                          <p className="text-[10px]">Click the progression controller to cycle task columns.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (mockKanbanState === 'todo') setMockKanbanState('progress');
                            else if (mockKanbanState === 'progress') setMockKanbanState('done');
                            else setMockKanbanState('todo');
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 select-none shrink-0"
                        >
                          <span>Advance Task Stage ⚡</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: SHIFT TRACKER */}
                  {mockActiveTab === 'attendance' && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Attendance Console Widget</span>
                          {mockAttendanceState === 'checked_in' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 text-[9px] font-black uppercase animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active Shift Ticking
                            </span>
                          ) : mockAttendanceState === 'checked_out' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-500 rounded border border-blue-100 text-[9px] font-black uppercase">
                              Shift Closed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-50 text-slate-450 rounded border border-slate-100 text-[9px] font-black uppercase">
                              Offline
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Live Console Card */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between min-h-[140px]">
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Shift status</span>
                              <h4 className="text-sm font-black text-slate-805 uppercase tracking-tight">
                                {mockAttendanceState === 'checked_in' ? 'Clocked In' : mockAttendanceState === 'checked_out' ? 'Checked Out' : 'Inactive'}
                              </h4>
                            </div>

                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400">Timer Log</span>
                              <span className="text-xs font-black text-slate-800 font-mono">
                                {mockAttendanceState === 'checked_in' ? '08:14:32' : mockAttendanceState === 'checked_out' ? '08:00:00' : '--:--:--'}
                              </span>
                            </div>
                          </div>

                          {/* Aggregate Hours Card */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between min-h-[140px]">
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cumulative Month Total</span>
                              <h4 className="text-2xl font-black text-slate-850">
                                {mockAttendanceState === 'checked_out' ? '172.25' : '164.25'}<span className="text-xs font-black text-slate-400 ml-1">hrs</span>
                              </h4>
                            </div>

                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[8px] font-black text-slate-450 uppercase tracking-wider">
                              Cycle: May 1 - May 31
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div className="text-xs text-slate-500 font-medium leading-tight text-center sm:text-left">
                          <p className="font-bold text-slate-700">Simulate Shift Logs.</p>
                          <p className="text-[10px]">Experience instant shift coordination check-ins.</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {mockAttendanceState === 'offline' && (
                            <button
                              onClick={() => setMockAttendanceState('checked_in')}
                              className="bg-jeallo-gradient text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 select-none"
                            >
                              Simulate Clock In ⚡
                            </button>
                          )}
                          {mockAttendanceState === 'checked_in' && (
                            <button
                              onClick={() => setMockAttendanceState('checked_out')}
                              className="bg-rose-500 hover:bg-rose-650 text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 select-none"
                            >
                              Clock Out & Save 🔴
                            </button>
                          )}
                          {mockAttendanceState === 'checked_out' && (
                            <button
                              onClick={() => setMockAttendanceState('offline')}
                              className="bg-slate-805 hover:bg-slate-750 text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 select-none"
                            >
                              Reset Simulator 🔄
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: LEAVE REQUEST REVIEW */}
                  {mockActiveTab === 'leaves' && (
                    <div className="space-y-6 flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Leave Approvals Backlog</span>
                          <span className="text-[10px] font-black text-slate-450 uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                            {mockLeavesList.filter(item => item.status === 'pending').length} Requests Pending
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {mockLeavesList.filter(item => item.status === 'pending').length > 0 ? (
                            mockLeavesList.filter(item => item.status === 'pending').map((leave) => (
                              <div 
                                key={leave.id}
                                className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in slide-in-from-top-1 duration-200"
                              >
                                <div className="text-left">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-800 leading-none">{leave.name}</span>
                                    <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-500 rounded border border-amber-100">
                                      {leave.type}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-bold block mb-1">Schedule: {leave.range}</p>
                                  <p className="text-[9px] text-slate-500 italic font-medium">"{leave.reason}"</p>
                                </div>

                                <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleActionLeave(leave.id, 'approved')}
                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-250 text-emerald-600 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all active:scale-95 select-none"
                                  >
                                    Approve ✓
                                  </button>
                                  <button
                                    onClick={() => handleActionLeave(leave.id, 'declined')}
                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-250 text-rose-500 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all active:scale-95 select-none"
                                  >
                                    Decline ✕
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="bg-emerald-50/10 border border-emerald-250 p-6 rounded-2xl text-center space-y-2 animate-in zoom-in duration-300">
                              <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                                ✓
                              </div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Queue Cleared Successfully</h4>
                              <p className="text-[10px] text-slate-500 font-medium">All pending employee leaves have been processed with complete operational records saved.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <div className="text-xs text-slate-500 font-medium leading-tight text-center sm:text-left">
                          <p className="font-bold text-slate-700">Team Resource Management.</p>
                          <p className="text-[10px]">Approve time-off requests with real-time operational feedback.</p>
                        </div>
                        
                        {mockLeavesList.filter(item => item.status === 'pending').length === 0 && (
                          <button
                            onClick={handleResetLeaves}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 select-none shrink-0"
                          >
                            Reset Queue 🔄
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-6 bg-white border-y border-slate-100/80 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-jeallo-primary font-black text-xs uppercase tracking-[0.3em]">
              <Sparkles className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Structured workflow. Beautiful performance.</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium leading-relaxed">
              Everything your enterprise workspace demands to track, verify, and complete targets without the friction. Click any feature below to inspect detailed capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresList.map((feature) => (
              <FeatureCard 
                key={feature.id}
                item={feature}
                onClick={(item) => setSelectedFeature(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer styled identical to the Login Footer Info */}
      <footer id="about" className="py-12 px-6 bg-[#f9fafb] border-t border-slate-100 z-10 relative mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-85 transition-opacity duration-300">
            <div className="w-7 h-7 bg-jeallo-gradient rounded-lg flex items-center justify-center">
              <Target className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-black text-slate-800 tracking-tighter uppercase">JEALLO</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] font-black text-slate-450 uppercase tracking-[0.25em]">
            <button onClick={() => { setActiveInfoTab('privacy'); }} className="hover:text-jeallo-primary uppercase outline-none transition-all">Privacy</button>
            <button onClick={() => { setActiveInfoTab('security'); }} className="hover:text-jeallo-primary uppercase outline-none transition-all">Security</button>
            <button onClick={() => { setActiveInfoTab('help'); }} className="hover:text-jeallo-primary uppercase outline-none transition-all">Help Center</button>
            <button onClick={() => { setActiveInfoTab('about'); }} className="hover:text-jeallo-primary uppercase outline-none transition-all">About</button>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            © 2026 JEALLO INC. REDEFINING MODERN WORK.
          </p>
        </div>
      </footer>

      {/* Feature Details Modal Popup */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedFeature(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-jeallo-primary/5 text-jeallo-primary rounded-md">
                {selectedFeature.category}
              </span>
              <button 
                onClick={() => setSelectedFeature(null)}
                className="text-slate-400 hover:text-slate-600 font-bold transition-all text-xs bg-slate-50 w-7 h-7 rounded-full flex items-center justify-center border border-slate-100"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-jeallo-gradient text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                {(() => {
                  const Icon = selectedFeature.icon;
                  return <Icon className="w-6 h-6" />;
                })()}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{selectedFeature.title}</h3>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {selectedFeature.details}
            </p>

            <button 
              onClick={() => setSelectedFeature(null)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Interactive Information Portal Modal (Privacy, Security, Help Center, About) */}
      {activeInfoTab && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => { setActiveInfoTab(null); setExpandedFaqIndex(null); }}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-jeallo-primary/5 rounded-xl flex items-center justify-center">
                  {getTabIcon()}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {getTabTitle()}
                </h2>
              </div>
              <button 
                onClick={() => { setActiveInfoTab(null); setExpandedFaqIndex(null); }}
                className="text-slate-400 hover:text-slate-600 font-bold transition-all text-xs bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Tab Controls */}
            <div className="flex items-center gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50 shrink-0">
              {[
                { id: 'about', label: 'About' },
                { id: 'privacy', label: 'Privacy' },
                { id: 'security', label: 'Security' },
                { id: 'help', label: 'FAQ / Help' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveInfoTab(tab.id); setExpandedFaqIndex(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeInfoTab === tab.id 
                      ? 'bg-jeallo-gradient text-white shadow-md shadow-jeallo-primary/10' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              
              {/* ABOUT TAB */}
              {activeInfoTab === 'about' && (
                <div className="space-y-6 text-slate-600 text-xs font-medium leading-relaxed">
                  <div className="bg-jeallo-primary/5 p-5 border border-jeallo-primary/10 rounded-2xl flex gap-3">
                    <Sparkles className="w-5 h-5 text-jeallo-primary shrink-0 mt-0.5" />
                    <p className="text-jeallo-primary font-bold text-xs uppercase tracking-wider leading-relaxed">
                      "Bridging agile complexity with visual convenience to streamline execution at light speed."
                    </p>
                  </div>
                  <p>
                    Jeallo was designed in 2026 with a simple mission: **make engineering and task planning friction-free**. Traditional software coordination systems like Jira provide robust planning details, but suffer from high administrative overhead. Meanwhile, lightweight board tools like Trello are simple, but fall short for enterprise security, rollups, and time logs.
                  </p>
                  <p>
                    Jeallo bridges this separation perfectly. We consolidate structural backlogs, visual columns, shift trackers, and leave approval dashboards into a premium, unified layout. Designed for developers, managers, and designers who care about shipping world-class platforms.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <h4 className="text-xl font-black text-slate-900 leading-none mb-1">100%</h4>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Dynamic Integrations</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <h4 className="text-xl font-black text-slate-900 leading-none mb-1">&lt; 10s</h4>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Vite Compile Time</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PRIVACY TAB */}
              {activeInfoTab === 'privacy' && (
                <div className="space-y-6 text-slate-600 text-xs font-medium leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-sm">1. Data Ownership & Sovereignty</h3>
                    <p>
                      At Jeallo, we enforce strict compliance: **your workspace data belongs strictly to you**. Project lists, sprint timelines, column cards, and comment histories are securely restricted to authenticated members of your active enterprise. We never transmit or resell logs.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-sm">2. Shift Verification & Tracking</h3>
                    <p>
                      Employee check-in coordinates, timestamp logs, and total daily work shift records are stored strictly for operational calculation. These logs are only visible to authorized administrators and workspace managers.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-sm">3. Local Session Cookies</h3>
                    <p>
                      We utilize secure browser configurations to retain local state tokens, avoiding excessive session authentication. These settings expire automatically and contain zero trackable marketing metadata.
                    </p>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeInfoTab === 'security' && (
                <div className="space-y-6 text-slate-600 text-xs font-medium leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-sm">1. Laravel Sanctum Secure API Tokens</h3>
                    <p>
                      All client requests route through secure authorization pipelines. Handshakes utilize secure, dynamic Sanctum tokens to block external route injections and sanitize request headers automatically.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-sm">2. Bcrypt Dynamic Password Hashing</h3>
                    <p>
                      User passwords undergo complex hashing through standard Bcrypt algorithms prior to database insertion. Real passphrases never reside in clear, text-readable state records.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-sm">3. Granular Route Permission Gaps (RBAC)</h3>
                    <p>
                      Jeallo utilizes a strict Role-Based Access Control (RBAC) system: employee actions are blocked from manager controls, and administrators must pass specific workspace token matches to review system logs.
                    </p>
                  </div>
                </div>
              )}

              {/* HELP & FAQ TAB */}
              {activeInfoTab === 'help' && (
                <div className="space-y-4">
                  {[
                    {
                      q: "How does the shift tracker calculate monthly hours?",
                      a: "When you click 'Clock In', a new database record initiates. Upon clicking 'Clock Out', the delta is calculated down to decimal points. The dashboard automatically queries your attendance history and sums completed shifts starting from the 1st of each month."
                    },
                    {
                      q: "How can managers approve team leaves?",
                      a: "Whenever an employee submits a leave request, it goes into a pending state. Managers receive this immediately in their dashboard's Leaves widget, allowing them to approve or decline with a custom comment mark in one click."
                    },
                    {
                      q: "How do I invite team members to a workspace?",
                      a: "Workspace admins can invite new members via email or add them manually in the 'Team List' interface. The system generates a unique 5-digit Employee ID and auto-associates them with the current workspace."
                    },
                    {
                      q: "Is data synchronized between boards in real-time?",
                      a: "Yes! Jeallo integrates active socket listeners and dynamic query validation to ensure task column updates, comments, and project velocities synchronize seamlessly across workspace viewports."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 transition-colors hover:border-slate-200">
                      <button 
                        onClick={() => toggleFaq(index)}
                        className="w-full px-5 py-4 flex items-center justify-between font-black text-slate-800 text-xs text-left select-none outline-none"
                      >
                        <span>{faq.q}</span>
                        {expandedFaqIndex === index ? (
                          <Minus className="w-4 h-4 text-jeallo-primary shrink-0 ml-4" />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                        )}
                      </button>
                      
                      {expandedFaqIndex === index && (
                        <div className="px-5 pb-5 pt-1 text-slate-500 font-medium text-xs border-t border-slate-100/60 leading-relaxed animate-in slide-in-from-top-1 duration-200">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-5 mt-6 text-right shrink-0">
              <button 
                onClick={() => { setActiveInfoTab(null); setExpandedFaqIndex(null); }}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Close Portal
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
