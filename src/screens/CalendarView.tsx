import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Trash2,
  Video,
  Phone,
  MapPin,
  Lock
} from 'lucide-react';
import { calendarService, type CalendarEvent, type CalendarEventType } from '../api/calendar';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import CalendarEventForm from '../components/CalendarEventForm';
import Tabs from '../components/Tabs';
import { usePermissions } from '../utils/permissions';
import { Permission, type UserProfile } from '../api/users';

interface CalendarViewProps {
  organizationId: string;
  user: UserProfile;
}

type ViewType = 'month' | 'week' | 'day';

const CalendarView: React.FC<CalendarViewProps> = ({ organizationId, user }) => {
  const permissions = usePermissions(user);
  const [view, setView] = useState<'calendar' | 'form'>('calendar');
  const [viewType, setViewType] = useState<ViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewFilter, setViewFilter] = useState<'my' | 'all'>(
    permissions.can(Permission.CALENDAR_VIEW_ALL) ? 'all' : 'my'
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // Calculate start and end based on viewType
      let start: Date, end: Date;
      
      if (viewType === 'month') {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (viewType === 'week') {
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      } else {
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
      }

      const response = await calendarService.getAll(organizationId, start.toISOString(), end.toISOString());
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [organizationId, currentDate.getTime(), viewType]);

  const handleSave = async (data: Partial<CalendarEvent>) => {
    if (editingEvent) {
      await calendarService.update(editingEvent.id, data, organizationId);
    } else {
      await calendarService.create(data, organizationId);
    }
    setView('calendar');
    setEditingEvent(null);
    fetchEvents();
  };

  const confirmDelete = async () => {
    if (!deletingEventId) return;
    setIsDeleting(true);
    try {
      await calendarService.delete(deletingEventId, organizationId);
      setEvents(prev => prev.filter(e => e.id !== deletingEventId));
      setDeletingEventId(null);
    } catch (err) {
      console.error('Failed to delete event', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter(event => {
    return viewFilter === 'all' || event.userId === user.id;
  });

  const getEventColor = (type: CalendarEventType) => {
    switch (type) {
      case 'MEETING': return 'var(--color-primary)';
      case 'CALL': return '#3b82f6';
      case 'SITE_VISIT': return '#f59e0b';
      case 'BLOCKER': return '#6b7280';
      default: return '#10b981';
    }
  };

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case 'MEETING': return <Video size={14} />;
      case 'CALL': return <Phone size={14} />;
      case 'SITE_VISIT': return <MapPin size={14} />;
      case 'BLOCKER': return <Lock size={14} />;
      default: return <CalendarIcon size={14} />;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    if (viewType === 'month') {
      nextDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewType === 'week') {
      nextDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      nextDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(nextDate);
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const daysInWeek = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const renderEventSnippet = (event: CalendarEvent) => (
    <div 
      key={event.id} 
      onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setView('form'); }} 
      style={{ 
        fontSize: '0.65rem', padding: '2px 4px', borderRadius: '2px', background: `${getEventColor(event.type)}15`,
        color: getEventColor(event.type), borderLeft: `2px solid ${getEventColor(event.type)}`, whiteSpace: 'nowrap', 
        overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', marginBottom: '2px'
      }}
    >
      {event.title}
    </div>
  );

  const renderMonthGrid = () => (
    <div className="card" style={{ padding: '1rem', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }}>
        {daysInMonth.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} style={{ background: 'var(--color-bg)', minHeight: '100px' }} />;
          const dayEvents = filteredEvents.filter(e => {
            const eventDate = new Date(e.startTime);
            return eventDate.getDate() === day.getDate() && eventDate.getMonth() === day.getMonth() && eventDate.getFullYear() === day.getFullYear();
          });
          const isToday = new Date().toDateString() === day.toDateString();
          return (
            <div key={day.toISOString()} style={{ background: 'var(--color-surface)', minHeight: '100px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ 
                fontSize: '0.75rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--color-primary)' : 'inherit',
                display: 'inline-flex', width: '1.5rem', height: '1.5rem', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', background: isToday ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent'
              }}>{day.getDate()}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {dayEvents.slice(0, 3).map(event => renderEventSnippet(event))}
                {dayEvents.length > 3 && <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>+{dayEvents.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekGrid = () => (
    <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
        {daysInWeek.map((day) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = filteredEvents.filter(e => new Date(e.startTime).toDateString() === day.toDateString());
          
          return (
            <div key={day.toISOString()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </p>
                <div style={{ 
                  width: '2rem', height: '2rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  background: isToday ? 'var(--color-primary)' : 'transparent', color: isToday ? 'white' : 'inherit', fontWeight: 700
                }}>
                  {day.getDate()}
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--color-bg)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                {dayEvents.map(event => (
                  <div key={event.id} onClick={() => { setEditingEvent(event); setView('form'); }} style={{ 
                    padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderLeft: `3px solid ${getEventColor(event.type)}`, marginBottom: '0.5rem', cursor: 'pointer'
                  }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.125rem' }}>{event.title}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayEvents = filteredEvents.filter(e => new Date(e.startTime).toDateString() === currentDate.toDateString());
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        </div>
        {dayEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dayEvents.map(event => (
              <div key={event.id} className="card" onClick={() => { setEditingEvent(event); setView('form'); }} style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: `${getEventColor(event.type)}15`, color: getEventColor(event.type), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getEventIcon(event.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{event.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={14}/> {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {event.contact && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><User size={14}/> {event.contact.firstName} {event.contact.lastName}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeletingEventId(event.id); }} style={{ color: 'var(--color-error)' }}><Trash2 size={18}/></Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <h3>No events scheduled</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>You're all clear for today.</p>
          </div>
        )}
      </div>
    );
  };

  if (view === 'form') {
    return (
      <CalendarEventForm 
        event={editingEvent}
        organizationId={organizationId}
        user={user}
        onSave={handleSave}
        onCancel={() => {
          setView('calendar');
          setEditingEvent(null);
        }}
      />
    );
  }

  const getHeaderTitle = () => {
    if (viewType === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (viewType === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Calendar</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Schedule meetings and manage your time.</p>
        </div>
        <Button onClick={() => { setEditingEvent(null); setView('form'); }} leftIcon={<Plus size={20} />}>Schedule Event</Button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
          <button onClick={() => navigateDate('prev')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}><ChevronLeft size={20}/></button>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, minWidth: '180px', textAlign: 'center' }}>{getHeaderTitle()}</h2>
          <button onClick={() => navigateDate('next')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}><ChevronRight size={20}/></button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Tabs 
            activeTab={viewType}
            onTabChange={(id) => setViewType(id as ViewType)}
            options={[
              { id: 'month', label: 'Month' },
              { id: 'week', label: 'Week' },
              { id: 'day', label: 'Day' }
            ]}
          />
          {permissions.can(Permission.CALENDAR_VIEW_ALL) && (
            <Tabs activeTab={viewFilter} onTabChange={(id) => setViewFilter(id as 'my' | 'all')} options={[{ id: 'my', label: 'My Calendar' }, { id: 'all', label: 'Team View' }]} />
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : (
        <div style={{ minHeight: '400px' }}>
          {viewType === 'month' && !isMobile && renderMonthGrid()}
          {viewType === 'week' && !isMobile && renderWeekGrid()}
          {(viewType === 'day' || isMobile) && renderDayView()}
        </div>
      )}

      <ConfirmModal isOpen={!!deletingEventId} onClose={() => setDeletingEventId(null)} onConfirm={confirmDelete} title="Delete Event" message="Are you sure you want to remove this event from the calendar?" variant="danger" isLoading={isDeleting} />
    </div>
  );
};

export default CalendarView;
