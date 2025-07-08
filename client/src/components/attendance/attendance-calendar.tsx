import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface AttendanceCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function AttendanceCalendar({ selectedDate, onDateSelect }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAttendanceStatus = (date: Date | null) => {
    if (!date) return 'no-class';
    
    const today = new Date();
    const dateStr = date.toISOString().split('T')[0];
    
    if (date > today) return 'no-class';
    
    // Mock attendance data - in real app, this would come from API
    const attendance = Math.random();
    if (attendance > 0.9) return 'present';
    if (attendance > 0.7) return 'partial';
    if (attendance > 0.5) return 'absent';
    return 'no-class';
  };

  const getAttendanceClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'attendance-present';
      case 'partial':
        return 'attendance-partial';
      case 'absent':
        return 'attendance-absent';
      default:
        return 'attendance-no-class';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <Card className="attendance-calendar">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Attendance Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {monthYear}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="w-8 h-8" />;
              }
              
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const status = getAttendanceStatus(date);
              
              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(dateStr)}
                  className={`attendance-day ${getAttendanceClass(status)} ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Legend:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 attendance-present rounded"></div>
                <span>High Attendance (90%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 attendance-partial rounded"></div>
                <span>Average (70-90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 attendance-absent rounded"></div>
                <span>Low Attendance (50-70%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 attendance-no-class rounded"></div>
                <span>No Classes</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
