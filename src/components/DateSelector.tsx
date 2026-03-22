import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateSelectorProps {
  label?: string;
  value: string | null; // YYYY-MM-DD
  onChange: (value: string | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  id,
  placeholder = 'Select date...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync viewDate when value changes externally (or when opening)
  useEffect(() => {
    if (value && isOpen) {
      setViewDate(new Date(value));
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long' });
  const year = viewDate.getFullYear();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(year, viewDate.getMonth(), day);
    // Format as YYYY-MM-DD local time
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (day: number) => {
    const d = new Date(year, viewDate.getMonth(), day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [vY, vM, vD] = value.split('-').map(Number);
    return vY === year && vM === viewDate.getMonth() + 1 && vD === day;
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label style={{ 
            fontSize: '0.8125rem', 
            fontWeight: 700, 
            color: 'var(--color-text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.025em' 
          }}>
            {label}{required && '*'}
          </label>
        )}
        {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 600 }}>{error}</span>}
      </div>

      <div
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
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
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
          boxShadow: error ? '0 0 0 1px var(--color-error), 0 0 0 4px rgba(220, 38, 38, 0.1)' : (isOpen ? '0 0 0 1px var(--color-primary), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' : 'none')
        }}
      >
        <CalendarIcon size={18} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '0.9375rem', color: value ? 'var(--color-text)' : 'var(--muted-foreground)', fontWeight: value ? 500 : 400 }}>
          {value ? formatDate(value) : placeholder}
        </div>
        {value && !disabled && (
          <X 
            size={16} 
            color="var(--muted-foreground)" 
            style={{ cursor: 'pointer' }} 
            onClick={handleClear} 
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile && (
              <div 
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 999
                }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, x: isMobile ? '-50%' : '-50%', y: isMobile ? 50 : -5 }}
              animate={{ opacity: 1, x: isMobile ? '-50%' : '-50%', y: isMobile ? '-50%' : 0 }}
              exit={{ opacity: 0, x: isMobile ? '-50%' : '-50%', y: isMobile ? 50 : -5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: isMobile ? 'fixed' : 'absolute',
                top: isMobile ? '50%' : '100%',
                left: isMobile ? '50%' : '50%',
                marginTop: isMobile ? 0 : '0.5rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-2xl)',
                zIndex: 1000,
                padding: isMobile ? '1.5rem' : '1.25rem',
                userSelect: 'none',
                width: isMobile ? 'calc(100vw - 2.5rem)' : '340px',
                maxWidth: '400px',
                pointerEvents: 'auto'
              }}
            >
              {isMobile && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginBottom: '1rem',
                  marginTop: '-0.5rem'
                }}>
                  <button 
                    onClick={() => setIsOpen(false)}
                    style={{ 
                      background: 'var(--color-bg-hover)', 
                      border: 'none', 
                      borderRadius: '50%', 
                      padding: '0.5rem', 
                      color: 'var(--color-text)',
                      cursor: 'pointer' 
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            {/* Calendar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={handlePrevMonth}
                style={{ padding: '0.25rem', borderRadius: '50%', border: 'none', background: 'var(--color-bg-hover)', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                {monthName} {year}
              </div>
              <button 
                type="button" 
                onClick={handleNextMonth}
                style={{ padding: '0.25rem', borderRadius: '50%', border: 'none', background: 'var(--color-bg-hover)', cursor: 'pointer', color: 'var(--color-text)' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekdays */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' }}>
              {weekdays.map(wd => (
                <div key={wd} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {wd[0]}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {/* Empty spaces for first week */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const active = isSelected(day);
                const current = isToday(day);
                
                return (
                  <div
                    key={day}
                    onClick={(e) => { e.stopPropagation(); handleDateSelect(day); }}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: active ? 'var(--color-primary)' : (current ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent'),
                      color: active ? 'white' : (current ? 'var(--color-primary)' : 'var(--color-text)'),
                      fontWeight: active || current ? 700 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = current ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent';
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const t = new Date();
                  const y = t.getFullYear();
                  const m = String(t.getMonth() + 1).padStart(2, '0');
                  const d = String(t.getDate()).padStart(2, '0');
                  onChange(`${y}-${m}-${d}`);
                  setIsOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Today
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateSelector;
