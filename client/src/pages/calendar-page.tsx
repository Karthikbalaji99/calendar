import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnerFilter } from "@/components/owner-filter";
import { useQuery } from "@tanstack/react-query";
import type { Memory, Task, GratitudeLog } from "@shared/schema";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "panda" | "cookie" | "both">("all");
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const { data: memories = [] } = useQuery<Memory[]>({ queryKey: ["/api/memories"] });
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: gratitudeLogs = [] } = useQuery<GratitudeLog[]>({ queryKey: ["/api/gratitude"] });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getEventsForDate = (dateStr: string) => {
    const filteredMemories = memories.filter((m) => {
      const matchesDate = m.date === dateStr;
      const matchesFilter =
        filter === "all" || m.owner === filter;
      return matchesDate && matchesFilter;
    });

    const filteredTasks = tasks.filter((t) => {
      const matchesDate = t.dueDate === dateStr;
      const matchesFilter =
        filter === "all" || t.owner === filter;
      return matchesDate && matchesFilter;
    });

    const filteredGratitude = gratitudeLogs.filter((g) => {
      const matchesDate = g.date === dateStr;
      const matchesFilter =
        filter === "all" ||
        (filter === "panda" && (g.from === "panda" || g.to === "panda")) ||
        (filter === "cookie" && (g.from === "cookie" || g.to === "cookie")) ||
        (filter === "both" && (g.from === "panda" || g.to === "panda" || g.from === "cookie" || g.to === "cookie"));
      return matchesDate && matchesFilter;
    });

    return {
      memories: filteredMemories,
      tasks: filteredTasks,
      gratitude: filteredGratitude,
    };
  };

  const monthNames = [
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">
            {monthNames[month]} {year}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} data-testid="button-today">
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <OwnerFilter value={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 h-[calc(100%-3rem)]">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const events = getEventsForDate(dateStr);
            const hasEvents =
              events.memories.length > 0 || events.tasks.length > 0 || events.gratitude.length > 0;
            const isToday =
              new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div
                key={day}
                className="relative"
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                data-testid={`calendar-date-${dateStr}`}
              >
                <Card
                  className={`h-full min-h-24 hover-elevate cursor-pointer transition-all ${
                    isToday ? "border-primary border-2" : ""
                  }`}
                >
                  <CardContent className="p-3 h-full flex flex-col">
                    <div
                      className={`text-sm font-medium mb-2 ${isToday ? "text-primary font-bold" : ""}`}
                    >
                      {day}
                    </div>
                    {hasEvents && (
                      <div className="flex gap-1 flex-wrap">
                        {events.memories.length > 0 && (
                          <div className="w-2 h-2 rounded-full bg-chart-3" />
                        )}
                        {events.tasks.length > 0 && (
                          <div className="w-2 h-2 rounded-full bg-chart-2" />
                        )}
                        {events.gratitude.length > 0 && (
                          <div className="w-2 h-2 rounded-full bg-chart-1" />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {hoveredDate === dateStr && hasEvents && (
                  <Card className="absolute z-10 top-full left-0 mt-2 w-64 shadow-lg">
                    <CardContent className="p-4 space-y-2">
                      <div className="font-semibold text-sm">
                        {monthNames[month]} {day}, {year}
                      </div>
                      {events.memories.map((memory) => (
                        <div key={memory.id} className="text-xs">
                          <span className="font-medium">Memory:</span> {memory.caption || "Photo"}
                        </div>
                      ))}
                      {events.tasks.map((task) => (
                        <div key={task.id} className="text-xs">
                          <span className="font-medium">Task:</span> {task.title}
                        </div>
                      ))}
                      {events.gratitude.map((log) => (
                        <div key={log.id} className="text-xs">
                          <span className="font-medium">Gratitude:</span> {log.from} → {log.to}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
