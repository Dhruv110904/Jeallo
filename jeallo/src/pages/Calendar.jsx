import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Video, MapPin, Clock, Tag, 
  Info, AlertCircle, CalendarDays, Trash2
} from 'lucide-react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';

export default function Calendar() {
  const calendarRef = useRef(null);
  const queryClient = useQueryClient();
  const { role } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const isAdmin = ['admin', 'super_admin'].includes(role?.toLowerCase());

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Event type interactive filters state
  const [selectedTypes, setSelectedTypes] = useState({
    meeting: true,
    deadline: true,
    holiday: true,
    leave: true
  });

  // Add Event Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventType, setEventType] = useState('meeting'); // 'meeting' or 'holiday'
  
  // Meeting fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingType, setMeetingType] = useState('other'); // 'zoom', 'google_meet', 'offline', 'other'

  // Holiday fields
  const [holidayName, setHolidayName] = useState('');
  const [holidayType, setHolidayType] = useState('public'); // 'public', 'company', 'other'

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', currentWorkspace?.id],
    queryFn: () => api.get('/v1/calendar/events').then(res => res.data),
    enabled: !!currentWorkspace?.id,
  });

  const resetAddForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setMeetingLink('');
    setMeetingType('other');
    setHolidayName('');
    setHolidayType('public');
  };

  const createMeetingMutation = useMutation({
    mutationFn: (data) => api.post('/v1/calendar/events', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-events']);
      toast.success('Meeting created successfully!');
      setIsAddModalOpen(false);
      resetAddForm();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create meeting'),
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: (id) => api.delete(`/v1/calendar/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-events']);
      toast.success('Meeting deleted successfully!');
      setIsModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete meeting'),
  });

  const createHolidayMutation = useMutation({
    mutationFn: (data) => api.post('/v1/calendar/holidays', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-events']);
      toast.success('Holiday created successfully!');
      setIsAddModalOpen(false);
      resetAddForm();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create holiday'),
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: (id) => api.delete(`/v1/calendar/holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar-events']);
      toast.success('Holiday deleted successfully!');
      setIsModalOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete holiday'),
  });

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const handleDateClick = (info) => {
    if (!isAdmin) return;
    setSelectedDate(info.date);
    const dateStr = format(info.date, 'yyyy-MM-dd');
    setStartTime(`${dateStr}T09:00`);
    setEndTime(`${dateStr}T10:00`);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (eventType === 'meeting') {
      if (!title || !startTime || !endTime) {
        toast.error('Title, start time, and end time are required.');
        return;
      }
      createMeetingMutation.mutate({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        meeting_link: meetingLink || null,
        type: meetingType,
      });
    } else {
      if (!holidayName) {
        toast.error('Holiday name is required.');
        return;
      }
      createHolidayMutation.mutate({
        name: holidayName,
        date: format(selectedDate, 'yyyy-MM-dd'),
        type: holidayType,
      });
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    const parts = selectedEvent.id.split('-');
    const type = parts[0];
    const id = parts[1];

    if (type === 'meeting') {
      deleteMeetingMutation.mutate(id);
    } else if (type === 'holiday') {
      deleteHolidayMutation.mutate(id);
    }
  };

  const filteredEvents = events?.filter(event => selectedTypes[event.type]) || [];

  const upcomingEvents = events
    ?.filter(event => {
      const eventDate = new Date(event.start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today && selectedTypes[event.type];
    })
    ?.sort((a, b) => new Date(a.start) - new Date(b.start))
    ?.slice(0, 4) || [];

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
                <div className="space-y-3">
                    {[
                        { key: 'meeting', label: 'Meetings', color: 'bg-[#1B3A6B]', icon: Video },
                        { key: 'deadline', label: 'Deadlines', color: 'bg-red-500', icon: AlertCircle },
                        { key: 'holiday', label: 'Holidays', color: 'bg-jeallo-orange', icon: CalendarDays },
                        { key: 'leave', label: 'Leaves', color: 'bg-slate-400', icon: Tag },
                    ].map((type) => {
                        const isActive = selectedTypes[type.key];
                        return (
                            <div 
                                key={type.key} 
                                onClick={() => setSelectedTypes(prev => ({ ...prev, [type.key]: !prev[type.key] }))}
                                className={`flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer group ${
                                    isActive 
                                        ? 'bg-slate-50/50 border-slate-100' 
                                        : 'bg-white border-transparent opacity-40 hover:opacity-70'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${isActive ? type.color : 'bg-slate-200'} text-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                                        <type.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-slate-700 text-sm">{type.label}</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                    isActive ? 'border-jeallo-primary bg-jeallo-primary text-white' : 'border-slate-300'
                                }`}>
                                    {isActive && <span className="text-[10px] font-black">✓</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Events List */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Upcoming</h3>
                    <span className="text-[10px] font-black bg-jeallo-primary/5 text-jeallo-primary px-2.5 py-1 rounded-full">
                        {upcomingEvents.length} Items
                    </span>
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {upcomingEvents.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs font-bold">No upcoming schedule</p>
                        </div>
                    ) : (
                        upcomingEvents.map((event) => {
                            const date = new Date(event.start);
                            return (
                                <div 
                                    key={event.id}
                                    onClick={() => {
                                        const calendarEvent = calendarRef.current?.getApi().getEventById(event.id);
                                        if (calendarEvent) {
                                            handleEventClick({ event: calendarEvent });
                                        } else {
                                            // Fallback if not loaded in view
                                            setSelectedEvent({
                                                id: event.id,
                                                title: event.title,
                                                start: date,
                                                backgroundColor: event.color,
                                                allDay: event.allDay,
                                                extendedProps: event.extendedProps || {}
                                            });
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all cursor-pointer group flex items-start gap-3"
                                >
                                    <div className="w-9 h-9 rounded-xl flex flex-col items-center justify-center border border-slate-200 bg-white shadow-sm flex-shrink-0 text-center">
                                        <span className="text-[9px] font-black text-slate-400 uppercase leading-none">{format(date, 'MMM')}</span>
                                        <span className="text-xs font-black text-slate-800 leading-none mt-0.5">{format(date, 'dd')}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-slate-800 truncate group-hover:text-jeallo-primary transition-colors">
                                            {event.title.replace(/^[^\s]+\s/, '')}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5 capitalize">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color }}></span>
                                            {event.type}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                    events={filteredEvents}
                    dayMaxEvents={3}
                    weekends={true}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
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
      {isModalOpen && selectedEvent && (() => {
        const eventTypePrefix = selectedEvent.id?.split('-')[0];
        const isDeletable = ['meeting', 'holiday'].includes(eventTypePrefix) && isAdmin;
        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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

                  <div className="flex gap-4">
                      {isDeletable && (
                          <button 
                              onClick={handleDeleteEvent}
                              disabled={deleteMeetingMutation.isPending || deleteHolidayMutation.isPending}
                              className="flex-1 bg-red-50 text-red-600 border border-red-100 py-5 rounded-2xl font-black text-lg hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                              <Trash2 className="w-5 h-5" />
                              DELETE
                          </button>
                      )}
                      <button 
                          onClick={() => setIsModalOpen(false)}
                          className={`bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all ${isDeletable ? 'flex-1' : 'w-full'}`}
                      >
                          CLOSE DETAILS
                      </button>
                  </div>
              </div>
          </div>
        );
      })()}

      {/* Add Event/Holiday Modal */}
      {isAddModalOpen && selectedDate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-2 bg-jeallo-gradient"></div>
                
                <div className="flex items-start justify-between mb-6 flex-shrink-0">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                            Administrative Action
                        </span>
                        <h2 className="text-2xl font-black text-slate-900">Add Schedule Item</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">Date: {format(selectedDate, 'MMMM dd, yyyy')}</p>
                    </div>
                    <div className="w-12 h-12 bg-jeallo-primary/5 rounded-2xl flex items-center justify-center text-jeallo-primary">
                        <Plus className="w-6 h-6" />
                    </div>
                </div>

                {/* Event Type Toggle */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 flex-shrink-0">
                    <button 
                        type="button"
                        onClick={() => setEventType('meeting')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                            eventType === 'meeting' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Company Meeting
                    </button>
                    <button 
                        type="button"
                        onClick={() => setEventType('holiday')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                            eventType === 'holiday' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Company Holiday
                    </button>
                </div>

                <form onSubmit={handleAddSubmit} className="space-y-5 overflow-y-auto flex-1 pr-2 pb-2">
                    {eventType === 'meeting' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Meeting Title</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter meeting title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Medium Type</label>
                                    <select 
                                        value={meetingType}
                                        onChange={(e) => setMeetingType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                    >
                                        <option value="google_meet">Google Meet</option>
                                        <option value="zoom">Zoom</option>
                                        <option value="offline">Offline</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Meeting Link</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://..."
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description</label>
                                <textarea 
                                    placeholder="Enter meeting details or agenda"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Holiday Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Christmas Day"
                                    value={holidayName}
                                    onChange={(e) => setHolidayName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Holiday Type</label>
                                <select 
                                    value={holidayType}
                                    onChange={(e) => setHolidayType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-jeallo-primary focus:bg-white transition-all"
                                >
                                    <option value="public">Public Holiday</option>
                                    <option value="company">Company Holiday</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 pt-4 flex-shrink-0">
                        <button 
                            type="button"
                            onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                            className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                        >
                            CANCEL
                        </button>
                        <button 
                            type="submit"
                            disabled={createMeetingMutation.isPending || createHolidayMutation.isPending}
                            className="flex-1 bg-jeallo-gradient text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-jeallo-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {createMeetingMutation.isPending || createHolidayMutation.isPending ? 'CREATING...' : 'CREATE SCHEDULE'}
                        </button>
                    </div>
                </form>
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
          color: #94a3b8;
          padding: 12px;
          transition: color 0.2s ease;
        }
        .jeallo-calendar .fc-daygrid-day:hover .fc-daygrid-day-number {
          color: #1b3a6b;
        }
        .jeallo-calendar .fc-day-today {
          background-color: #fff1f2 !important;
          position: relative;
        }
        .jeallo-calendar .fc-day-today .fc-daygrid-day-number {
          color: #f43f5e;
          font-weight: 900;
        }
        .jeallo-calendar .fc-daygrid-day {
          transition: background-color 0.2s ease;
        }
        .jeallo-calendar .fc-daygrid-day:hover {
          background-color: #f8fafc !important;
        }
        .jeallo-calendar .fc-event {
          border: none;
          margin: 3px 6px !important;
          border-radius: 0.75rem !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .jeallo-calendar .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          filter: brightness(1.05);
        }
        .jeallo-calendar .fc-scrollgrid {
          border: none !important;
        }
        .jeallo-calendar .fc-day-sun, .jeallo-calendar .fc-day-sat {
          background-color: #fafbfc;
        }
        .jeallo-calendar .fc-daygrid-day-frame {
          min-height: 100px;
        }
      `}} />
    </div>
  );
}
