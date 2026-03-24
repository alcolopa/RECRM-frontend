import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface DateSelectorProps {
  label?: string;
  value: string | null; // ISO string or YYYY-MM-DD
  onChange: (value: string | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  includeTime?: boolean;
  onOpen?: () => void;
}

type ViewMode = 'calendar' | 'month' | 'year';

const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  id,
  placeholder = 'Select date...',
  includeTime = false,
  onOpen
}) => {
  const getNext15MinSlot = (date: Date) => {
    const ms = 1000 * 60 * 15; // 15 minutes in ms
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return getNext15MinSlot(new Date());
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef<HTMLDivElement>(null);

  // 12-hour format time state
  const [timeState, setTimeState] = useState(() => {
    const d = value ? new Date(value) : getNext15MinSlot(new Date());
    let hours = d.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    return {
      hour: String(hours),
      minute: String(d.getMinutes()).padStart(2, '0'),
      period
    };
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    setViewMode('calendar');
    if (nextState && onOpen) {
      setTimeout(onOpen, 100);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (includeTime) {
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${datePart} at ${timePart}`;
    }
    
    return datePart;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const updateDateTime = (date: Date, h: string, m: string, p: string) => {
    let hour = parseInt(h);
    if (p === 'PM' && hour < 12) hour += 12;
    if (p === 'AM' && hour === 12) hour = 0;
    
    const newDate = new Date(date);
    newDate.setHours(hour, parseInt(m), 0, 0);
    
    if (includeTime) {
      onChange(newDate.toISOString());
    } else {
      const yyyy = newDate.getFullYear();
      const mm = String(newDate.getMonth() + 1).padStart(2, '0');
      const dd = String(newDate.getDate()).padStart(2, '0');
      onChange(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    updateDateTime(selectedDate, timeState.hour, timeState.minute, timeState.period);
    if (!includeTime) setIsOpen(false);
  };

  const handleTimePartChange = (type: 'hour' | 'minute' | 'period', val: string) => {
    const newState = { ...timeState, [type]: val };
    setTimeState(newState);
    if (value) {
      updateDateTime(new Date(value), newState.hour, newState.minute, newState.period);
    } else {
      updateDateTime(new Date(), newState.hour, newState.minute, newState.period);
    }
  };

  const isDayToday = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d.toDateString() === new Date().toDateString();
  };

  const isDaySelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const years = useMemo(() => {
    const startYear = new Date().getFullYear() - 10;
    return Array.from({ length: 30 }, (_, i) => startYear + i);
  }, []);

  const timeOptions = {
    hours: Array.from({ length: 12 }, (_, i) => String(i + 1)),
    minutes: ['00', '15', '30', '45'],
    periods: ['AM', 'PM']
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', position: 'relative' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            {label}{required && '*'}
          </label>
          {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 600 }}>{error}</span>}
        </div>
      )}

      <div
        id={id}
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius)',
          border: `1px solid ${error ? 'var(--color-error)' : (isOpen ? 'var(--color-primary)' : 'var(--color-border)')}`,
          background: disabled ? 'var(--color-bg)' : 'var(--color-surface)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '2.75rem',
          boxShadow: error ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : (isOpen ? '0 0 0 1px var(--color-primary), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none')
        }}
      >
        <CalendarIcon size={18} color="var(--color-text-muted)" />
        <div style={{ flex: 1, fontSize: '0.9375rem', color: value ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: value ? 500 : 400 }}>
          {value ? formatDate(value) : placeholder}
        </div>
        {value && !disabled && <X size={16} color="var(--color-text-muted)" onClick={(e) => { e.stopPropagation(); onChange(null); }} />}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: isMobile ? 'relative' : 'absolute',
              top: isMobile ? 'auto' : '100%',
              left: 0,
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: isMobile ? 'none' : 'var(--shadow-xl)',
              zIndex: 2100,
              padding: '1.25rem',
              width: isMobile ? '100%' : '320px',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(currentYear, currentMonth - 1, 1)); }} style={navBtnStyle}><ChevronLeft size={18} /></button>
              <div 
                onClick={() => setViewMode(viewMode === 'calendar' ? 'month' : viewMode === 'month' ? 'year' : 'calendar')}
                style={{ fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}
              >
                {viewMode === 'calendar' ? `${monthNames[currentMonth]} ${currentYear}` : viewMode === 'month' ? currentYear : 'Select Year'}
                <ChevronDown size={14} />
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(currentYear, currentMonth + 1, 1)); }} style={navBtnStyle}><ChevronRight size={18} /></button>
            </div>

            {viewMode === 'calendar' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => <div key={i}>{wd}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const active = isDaySelected(day);
                    const current = isDayToday(day);
                    return (
                      <div key={day} onClick={() => handleDateSelect(day)} style={{
                        aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', borderRadius: '50%', cursor: 'pointer',
                        backgroundColor: active ? 'var(--color-primary)' : (current ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent'),
                        color: active ? 'white' : (current ? 'var(--color-primary)' : 'var(--color-text)'),
                        fontWeight: active || current ? 700 : 400,
                        transition: 'all 0.2s',
                        border: active ? 'none' : (current ? '1px solid var(--color-primary)' : 'none')
                      }}>{day}</div>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === 'month' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {monthNames.map((name, i) => (
                  <button key={name} onClick={() => { setViewDate(new Date(currentYear, i, 1)); setViewMode('calendar'); }} style={{ padding: '0.75rem 0', borderRadius: 'var(--radius)', border: 'none', background: currentMonth === i ? 'var(--color-primary)' : 'var(--color-bg)', color: currentMonth === i ? 'white' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.8125rem' }}>{name.slice(0, 3)}</button>
                ))}
              </div>
            )}

            {viewMode === 'year' && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }} className="no-scrollbar">
                {years.map(year => (
                  <button key={year} onClick={() => { setViewDate(new Date(year, currentMonth, 1)); setViewMode('month'); }} style={{ padding: '0.75rem 0', borderRadius: 'var(--radius)', border: 'none', background: currentYear === year ? 'var(--color-primary)' : 'var(--color-bg)', color: currentYear === year ? 'white' : 'var(--color-text)', cursor: 'pointer', fontSize: '0.8125rem' }}>{year}</button>
                ))}
              </div>
            )}

            {includeTime && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                  <Clock size={14} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Time Selection</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', height: '120px', position: 'relative', overflow: 'hidden' }}>
                  {/* Wheel Overlay Shadow */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: 'linear-gradient(to bottom, var(--color-surface) 0%, transparent 40%, transparent 60%, var(--color-surface) 100%)' }} />
                  {/* Active Indicator */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', height: '32px', backgroundColor: 'var(--color-bg)', borderRadius: '0.5rem', zIndex: 1 }} />

                  <TimeWheel options={timeOptions.hours} value={timeState.hour} onChange={val => handleTimePartChange('hour', val)} />
                  <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, zIndex: 3 }}>:</div>
                  <TimeWheel options={timeOptions.minutes} value={timeState.minute} onChange={val => handleTimePartChange('minute', val)} />
                  <div style={{ width: '1rem' }} />
                  <TimeWheel options={timeOptions.periods} value={timeState.period} onChange={val => handleTimePartChange('period', val)} />
                </div>

                <Button fullWidth onClick={() => setIsOpen(false)} size="sm" style={{ marginTop: '1rem' }}>Confirm Time</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TimeWheel: React.FC<{ options: string[], value: string, onChange: (val: string) => void }> = ({ options, value, onChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 32;

  useEffect(() => {
    if (scrollRef.current) {
      const index = options.indexOf(value);
      scrollRef.current.scrollTop = index * itemHeight;
    }
  }, [value, options]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollTop / itemHeight);
      if (options[index] && options[index] !== value) {
        onChange(options[index]);
      }
    }
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="no-scrollbar"
      style={{
        height: '100%',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        width: '40px',
        zIndex: 3,
        padding: '44px 0' // Padding to allow first and last items to center
      }}
    >
      {options.map(opt => (
        <div key={opt} style={{
          height: `${itemHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9375rem',
          fontWeight: value === opt ? 800 : 400,
          color: value === opt ? 'var(--color-primary)' : 'var(--color-text-muted)',
          scrollSnapAlign: 'center',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }} onClick={() => onChange(opt)}>
          {opt}
        </div>
      ))}
    </div>
  );
};

const navBtnStyle: React.CSSProperties = { padding: '0.4rem', borderRadius: '50%', border: 'none', background: 'var(--color-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', transition: 'background 0.2s' };

export default DateSelector;
