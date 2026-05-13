import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import TaskModal from '../components/TaskModal';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => api.get('/calendar/events').then(res => res.data),
  });

  const handleDateClick = (arg) => {
    setSelectedTask({ due_date: arg.dateStr });
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    const task = events.find(e => String(e.id) === String(info.event.id));
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Calendar</h1>
          <p className="text-slate-400 mt-1">View and manage deadlines visually</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
            <button 
              onClick={() => calendarRef.current.getApi().prev()}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => calendarRef.current.getApi().next()}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl jeallo-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={(eventInfo) => (
            <div className="p-1 px-2 overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0`} style={{ backgroundColor: eventInfo.event.backgroundColor }}></div>
                <span className="text-[10px] font-bold text-white truncate leading-none">{eventInfo.event.title}</span>
              </div>
            </div>
          )}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .jeallo-calendar .fc {
          --fc-border-color: #1e293b;
          --fc-daygrid-event-dot-width: 6px;
          --fc-today-bg-color: rgba(79, 70, 229, 0.05);
          font-family: inherit;
        }
        .jeallo-calendar .fc-theme-standard td, .jeallo-calendar .fc-theme-standard th {
          border-color: #1e293b;
        }
        .jeallo-calendar .fc-col-header-cell {
          padding: 12px 0;
          background: rgba(30, 41, 59, 0.3);
        }
        .jeallo-calendar .fc-col-header-cell-cushion {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .jeallo-calendar .fc-daygrid-day-number {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          padding: 8px;
        }
        .jeallo-calendar .fc-day-today .fc-daygrid-day-number {
          color: #6366f1;
          font-weight: 800;
        }
        .jeallo-calendar .fc-event {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          margin: 2px 4px;
        }
      `}} />

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask}
      />
    </div>
  );
}
