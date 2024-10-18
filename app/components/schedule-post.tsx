import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface SchedulePostProps {
  buttonName: string;
  generatedIndex: number;
  onSchedulePost: (index: number) => void;
  scheduleStates: {
    isOpen: boolean;
    selectedDate: Date;
    currentMonth: number;
    currentYear: number;
  }[];
  setScheduleStates: React.Dispatch<
    React.SetStateAction<
      {
        isOpen: boolean;
        selectedDate: Date;
        currentMonth: number;
        currentYear: number;
      }[]
    >
  >;
}

export default function SchedulePost({
  buttonName,
  generatedIndex,
  onSchedulePost,
  scheduleStates,
  setScheduleStates,
}: SchedulePostProps) {
  if (generatedIndex === -1 || !scheduleStates[generatedIndex]) {
    console.error(`Invalid generatedIndex: ${generatedIndex}`);
    return null;
  }
  const currentState = scheduleStates[generatedIndex];

  const handlePrevMonth = (index: number) => {
    setScheduleStates((prev) =>
      prev.map((state, i) => {
        if (i === index) {
          const newMonth =
            state.currentMonth === 0 ? 11 : state.currentMonth - 1;
          const newYear =
            state.currentMonth === 0
              ? state.currentYear - 1
              : state.currentYear;
          return { ...state, currentMonth: newMonth, currentYear: newYear };
        }
        return state;
      })
    );
  };

  const handleNextMonth = (index: number) => {
    setScheduleStates((prev) =>
      prev.map((state, i) => {
        if (i === index) {
          const newMonth =
            state.currentMonth === 11 ? 0 : state.currentMonth + 1;
          const newYear =
            state.currentMonth === 11
              ? state.currentYear + 1
              : state.currentYear;
          return { ...state, currentMonth: newMonth, currentYear: newYear };
        }
        return state;
      })
    );
  };

  const handleDateClick = (day: number) => {
    setScheduleStates((prev) =>
      prev.map((state, i) => {
        if (i === generatedIndex) {
          return {
            ...state,
            selectedDate: new Date(state.currentYear, state.currentMonth, day),
          };
        }
        return state;
      })
    );
  };

  const renderCalendar = () => {
    const { currentYear, currentMonth, selectedDate } = currentState;
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${
                        isSelected ? "bg-black text-white" : "hover:bg-gray-200"
                      }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };
  return (
    <Popover
      open={currentState.isOpen}
      onOpenChange={(open: boolean) => {
        setScheduleStates((prev) =>
          prev.map((state, i) =>
            i === generatedIndex ? { ...state, isOpen: open } : state
          )
        );
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          {buttonName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 w-64">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => handlePrevMonth(generatedIndex)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-semibold">
              {months[currentState.currentMonth]} {currentState.currentYear}
            </div>
            <button
              onClick={() => handleNextMonth(generatedIndex)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          <Button
            onClick={() => onSchedulePost(generatedIndex)}
            className="w-full mt-4"
          >
            Confirm Schedule
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
