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
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-8 bg-white/70 backdrop-blur-md border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:shadow-jeallo-primary/5 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-jeallo-primary/5 to-jeallo-orange/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
    <div className="w-14 h-14 bg-jeallo-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-jeallo-primary/20 group-hover:rotate-6 transition-all">
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
  </div>
);

export default function Landing() {
  const { token } = useAuthStore();

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans selection:bg-jeallo-primary/10">
      {/* Cool Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-jeallo-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-jeallo-orange/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-tr from-jeallo-primary/2 to-jeallo-orange/2 rounded-full blur-[150px]"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-jeallo-gradient rounded-xl flex items-center justify-center shadow-lg shadow-jeallo-primary/20">
              <Target className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Jeallo</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-xs font-black text-slate-500 uppercase tracking-widest">
            <a href="#features" className="hover:text-jeallo-primary transition-colors">Features</a>
            <a href="#solutions" className="hover:text-jeallo-primary transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-jeallo-primary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to={token ? "/dashboard" : "/login"} 
              className="text-sm font-black text-white bg-jeallo-gradient px-7 py-3 rounded-xl transition-all shadow-lg shadow-jeallo-primary/20 hover:scale-105 active:scale-95"
            >
              {token ? "Dashboard" : "Member Login"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-jeallo-primary/10 text-jeallo-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10 border border-jeallo-primary/20 animate-bounce">
            <Rocket className="w-4 h-4 fill-current" />
            Launch into productivity
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 tracking-tighter mb-8 leading-[0.95]">
            Master your tasks <br />
            with <span className="text-jeallo-gradient">unmatched</span> speed.
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Jeallo combines the depth of Jira with the simplicity of Trello. 
            The only workspace your team will ever need to ship world-class products.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to={token ? "/dashboard" : "/login"} 
              className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 group"
            >
              Employee Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 px-10 py-5 rounded-2xl font-black text-lg border-2 border-slate-100 transition-all flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-jeallo-orange" />
              Watch Demo
            </button>
          </div>

          {/* Floating UI Elements / Mockup */}
          <div className="mt-32 relative max-w-5xl mx-auto group">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-jeallo-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-jeallo-orange/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            <div className="relative rounded-[3rem] border border-slate-100 bg-white p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-6 pt-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Dashboard" 
                className="w-full rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { val: "10k+", label: "Power Users" },
            { val: "1.2M", label: "Tasks Shipped" },
            { val: "99.9%", label: "System Uptime" },
            { val: "4.9/5", label: "User Rating" }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-5xl font-black text-slate-900 mb-2 tracking-tighter group-hover:text-jeallo-gradient transition-all">{stat.val}</div>
              <div className="text-slate-400 font-black text-xs uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 text-jeallo-orange font-black text-xs uppercase tracking-[0.3em] mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Built for speed. <br /> Designed for you.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Everything you need to ship products faster without the complexity of traditional tools.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={Layout} 
              title="Kanban Perfection" 
              description="Visualize your entire workflow with our industry-leading drag-and-drop board system." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Predictive Analytics" 
              description="Deep dive into team performance with AI-powered forecasting and real-time metrics." 
            />
            <FeatureCard 
              icon={Clock} 
              title="Smart Time Tracking" 
              description="Monitor how every minute is spent with frictionless time logging built into your workflow." 
            />
            <FeatureCard 
              icon={Users} 
              title="Collaborative Pulse" 
              description="Manage employee roles and availability with real-time presence and smart notifications." 
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Precision Deadlines" 
              description="Never miss a milestone again with visual calendars and automated commitment tracking." 
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Hardened Security" 
              description="Bank-grade security and granular role-based access control keep your data safe." 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-3xl shadow-slate-900/40">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-jeallo-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-jeallo-orange/20 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-none">Ready to upgrade <br /> your team's DNA?</h2>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl active:scale-95"
            >
              Access Dashboard
              <ArrowRight className="w-7 h-7" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-slate-100 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-jeallo-gradient rounded-xl flex items-center justify-center">
                <Target className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Jeallo</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-jeallo-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-jeallo-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-jeallo-primary transition-colors">Cookies</a>
              <a href="#" className="hover:text-jeallo-primary transition-colors">Contact</a>
            </div>

            <div className="flex gap-6">
              {[Zap, ShieldCheck, Users].map((Icon, i) => (
                <a key={i} href="#" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-jeallo-primary hover:bg-jeallo-primary/5 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-slate-50">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 Jeallo Inc. Redefining modern work.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
