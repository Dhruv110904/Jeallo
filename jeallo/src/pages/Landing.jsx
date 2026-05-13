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
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-all group">
    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default function Landing() {
  const { token } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Target className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Jeallo</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"} 
              className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {token ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-sm font-bold mb-8 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
            <span>Introducing Jeallo 2.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
            Manage tasks with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Precision.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The all-in-one workspace for modern teams. Track tasks, manage employees, 
            and visualize productivity with premium analytics and real-time collaboration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"} 
              className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto bg-slate-800/50 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg border border-slate-700 transition-all">
              Watch Demo
            </button>
          </div>

          {/* Dashboard Preview Overlay */}
          <div className="mt-24 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative rounded-[2rem] border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 mb-4 px-4 pt-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Jeallo Dashboard Preview" 
                className="w-full rounded-2xl opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">10k+</div>
            <div className="text-slate-500 font-medium">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">1M+</div>
            <div className="text-slate-500 font-medium">Tasks Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-500 font-medium">Uptime Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-slate-500 font-medium">Expert Support</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for speed. <br /> Designed for people.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to ship products faster without the complexity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Layout} 
              title="Kanban Perfection" 
              description="Visualize your entire workflow with our intuitive drag-and-drop board system." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              description="Deep dive into team performance with custom reports and real-time metrics." 
            />
            <FeatureCard 
              icon={Clock} 
              title="Time Tracking" 
              description="Monitor how every minute is spent with integrated time logging for every task." 
            />
            <FeatureCard 
              icon={Users} 
              title="Team Directory" 
              description="Manage employee roles, permissions and availability in one central place." 
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Smart Deadlines" 
              description="Never miss a milestone again with visual calendar views and automated reminders." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Enterprise Security" 
              description="Role-based access control keeps your sensitive data restricted and secure." 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to transform <br /> your productivity?</h2>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-xl"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Jeallo</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Jeallo Inc. All rights reserved. Designed for excellence.</p>
          <div className="flex gap-6 text-slate-500">
            <a href="#" className="hover:text-white transition-colors"><Zap className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><ShieldCheck className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Users className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
