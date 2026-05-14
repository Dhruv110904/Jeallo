import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Video, MapPin, Clock, Tag, 
  Info, AlertCircle, CalendarDays
} from 'lucide-react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => api.get('/v1/calendar/events').then(res => res.data),
  });

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Schedule & Events</h1>
          <p className="text-slate-500 font-medium text-lg">Track meetings, deadlines, and holidays in one place.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => calendarRef.current.getApi().prev()}
              className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-jeallo-primary transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="px-6 py-3 flex items-center justify-center min-w-[160px]">
                <span className="font-black text-slate-900 uppercase tracking-widest text-sm">
                    {calendarRef.current?.getApi().view.title || 'Current Month'}
                </span>
            </div>
            <button 
              onClick={() => calendarRef.current.getApi().next()}
              className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-jeallo-primary transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Legend / Info Side */}
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Event Types</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Meetings', color: 'bg-[#1B3A6B]', icon: Video },
                        { label: 'Deadlines', color: 'bg-red-500', icon: AlertCircle },
                        { label: 'Holidays', color: 'bg-jeallo-orange', icon: CalendarDays },
                        { label: 'Leaves', color: 'bg-slate-400', icon: Tag },
                    ].map((type, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer">
                            <div className={`w-10 h-10 ${type.color} text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                <type.icon className="w-5 h-5" />
                            </div>
                            <span className="font-black text-slate-700 text-sm">{type.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-jeallo-gradient p-8 rounded-[2.5rem] text-white shadow-xl shadow-jeallo-primary/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-black text-lg mb-2">Weekend Policy</h3>
                    <p className="text-white/80 text-xs font-medium leading-relaxed">
                        Saturdays and Sundays are marked as default holidays. All other regional or company holidays are managed by HR.
                    </p>
                </div>
                <CalendarIcon className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
            </div>
        </div>

        {/* Calendar Main */}
        <div className="lg:col-span-3">
            <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm jeallo-calendar">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    events={events}
                    dayMaxEvents={3}
                    weekends={true}
                    eventClick={handleEventClick}
                    eventContent={(eventInfo) => (
                        <div className={`p-1.5 px-3 rounded-lg overflow-hidden border-l-4 border-black/10 transition-all hover:brightness-110 cursor-pointer shadow-sm`} style={{ backgroundColor: eventInfo.event.backgroundColor }}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter">
                                    {eventInfo.event.title}
                                </span>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: selectedEvent.backgroundColor }}></div>
                
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                            {selectedEvent.extendedProps.type || 'Event'} Details
                        </span>
                        <h2 className="text-2xl font-black text-slate-900">{selectedEvent.title}</h2>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <Info className="w-6 h-6 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time & Date</p>
                            <p className="font-bold text-slate-700">
                                {format(selectedEvent.start, 'EEEE, MMM dd, yyyy')}
                                {!selectedEvent.allDay && ` • ${format(selectedEvent.start, 'HH:mm')}`}
                            </p>
                        </div>
                    </div>

                    {selectedEvent.extendedProps.location && (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location / Type</p>
                                <p className="font-bold text-slate-700 uppercase">{selectedEvent.extendedProps.location}</p>
                            </div>
                        </div>
                    )}

                    {selectedEvent.extendedProps.link && (
                        <div className="p-4 bg-jeallo-primary/5 rounded-2xl border border-jeallo-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Video className="w-5 h-5 text-jeallo-primary" />
                                <span className="font-black text-sm text-jeallo-primary">Meeting Link Ready</span>
                            </div>
                            <a 
                                href={selectedEvent.extendedProps.link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-4 py-2 bg-jeallo-primary text-white rounded-xl text-xs font-black shadow-lg shadow-jeallo-primary/20 hover:scale-105 transition-all"
                            >
                                JOIN NOW
                            </a>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all"
                >
                    CLOSE DETAILS
                </button>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .jeallo-calendar .fc {
          --fc-border-color: #f8fafc;
          --fc-daygrid-event-dot-width: 8px;
          --fc-today-bg-color: #fff1f2;
          font-family: inherit;
          border: none;
        }
        .jeallo-calendar .fc-theme-standard td, .jeallo-calendar .fc-theme-standard th {
          border-color: #f1f5f9;
        }
        .jeallo-calendar .fc-col-header-cell {
          padding: 20px 0;
          background: #f8fafc;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .jeallo-calendar .fc-col-header-cell-cushion {
          font-size: 11px;
          font-weight: 900;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .jeallo-calendar .fc-daygrid-day-number {
          font-size: 13px;
          font-weight: 800;
          color: #cbd5e1;
          padding: 12px;
        }
        .jeallo-calendar .fc-day-today .fc-daygrid-day-number {
          color: #f43f5e;
          font-weight: 900;
        }
        .jeallo-calendar .fc-event {
          border: none;
          margin: 2px 4px;
        }
        .jeallo-calendar .fc-scrollgrid {
          border: none !important;
        }
        .jeallo-calendar .fc-day-sun, .jeallo-calendar .fc-day-sat {
          background-color: #fcfcfc;
        }
      `}} />
    </div>
  );
}
