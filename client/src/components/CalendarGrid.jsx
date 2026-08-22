import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Tag, MapPin } from 'lucide-react';

export default function CalendarGrid({ days = [], selectedDate, onSelectDate, tripStartDate, tripEndDate }) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    return tripStartDate ? new Date(tripStartDate) : new Date();
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Build Grid Matrix
  const gridCells = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    gridCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    gridCells.push({ day, dateStr: formattedDate });
  }

  // Find matching day object from itinerary
  const getDayData = (dateStr) => {
    return days.find((d) => d.date === dateStr);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      {/* Month Header Navigation */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center gap-2">
          <CalendarIcon style={{ width: 20, height: 20, color: '#3b82f6' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="btn btn-secondary" style={{ padding: '0.35rem 0.55rem' }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={handleNextMonth} className="btn btn-secondary" style={{ padding: '0.35rem 0.55rem' }}>
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 gap-1" style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {dayNames.map((d) => (
          <div key={d} style={{ padding: '0.35rem 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-1">
        {gridCells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty_${index}`} style={{ minHeight: '75px', borderRadius: 'var(--radius-sm)' }} />;
          }

          const dayData = getDayData(cell.dateStr);
          const isSelected = selectedDate === cell.dateStr;
          const isTripDay = !!dayData;
          const activityCount = dayData?.activities?.length || 0;

          return (
            <div
              key={cell.dateStr}
              onClick={() => isTripDay && onSelectDate(cell.dateStr)}
              style={{
                minHeight: '80px',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '2px solid #3b82f6' : isTripDay ? '1px solid var(--border-glow)' : '1px solid transparent',
                background: isSelected
                  ? 'rgba(59, 130, 246, 0.25)'
                  : isTripDay
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.01)',
                cursor: isTripDay ? 'pointer' : 'default',
                opacity: isTripDay ? 1 : 0.4,
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '0.85rem', fontWeight: isTripDay ? 700 : 400, color: isSelected ? '#ffffff' : isTripDay ? 'var(--text-primary)' : 'var(--text-dimmed)' }}>
                  {cell.day}
                </span>

                {isTripDay && (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                    Day {dayData.dayNumber}
                  </span>
                )}
              </div>

              {/* City Stop / Activity Badges */}
              {isTripDay && (
                <div style={{ marginTop: '0.35rem' }}>
                  {dayData.stop && (
                    <div style={{ fontSize: '0.68rem', color: '#34d399', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      📍 {dayData.stop.city}
                    </div>
                  )}

                  {activityCount > 0 && (
                    <div style={{ fontSize: '0.68rem', color: '#60a5fa', marginTop: '0.15rem' }}>
                      🎡 {activityCount} {activityCount === 1 ? 'act' : 'acts'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
