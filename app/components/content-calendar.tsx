import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { Ban, CalendarCheck2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ScheduledPost } from "./playground";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ContentCalendarProps {
  scheduledPosts: ScheduledPost[];
}

export default function ContentCalendar({
  scheduledPosts,
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dayHeaders = daysOfWeek.map((dayOfWeek) => (
      <div key={dayOfWeek} className="text-center font-bold p-2">
        {dayOfWeek}
      </div>
    ));
    rows.push(
      <div className="grid grid-cols-7 gap-px bg-gray-200" key="header">
        {dayHeaders}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayPosts = scheduledPosts.filter((post) =>
          isSameDay(parseISO(post.date), cloneDay)
        );
        days.push(
          <div
            className={`bg-white p-2 min-h-[100px] ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : isSameDay(day, new Date())
                ? "bg-blue-100"
                : ""
            }`}
            key={day.toString()}
          >
            <span className="text-sm font-medium">{formattedDate}</span>
            {dayPosts.map((post) => (
              <div
                key={post.id}
                className="mt-1 text-xs bg-pink-100 rounded p-1 truncate cursor-pointer hover:bg-pink-200"
                onClick={() => handleOpenContentViewer(post)}
              >
                {post.content.substring(0, 30)}...
              </div>
            ))}
          </div>
        );
        day = addMonths(day, 0);
        day.setDate(day.getDate() + 1);
      }
      rows.push(
        <div
          className="grid grid-cols-7 gap-px bg-gray-200"
          key={day.toString()}
        >
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">{rows}</div>
    );
  };

  const handleOpenContentViewer = (post: ScheduledPost) => {
    setSelectedPost(post);
    setIsContentViewerOpen(true);
  };

  const handleCancelScheduledPost = () => {
    if (selectedPost) {
      setScheduledPosts(
        scheduledPosts.filter((post) => post.id !== selectedPost.id)
      );
      setIsContentViewerOpen(false);
      setSelectedPost(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Content Calendar</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>{renderCalendar()}</CardContent>
      </Card>
      <Dialog open={isContentViewerOpen} onOpenChange={setIsContentViewerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scheduled Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Scheduled for:{" "}
              {selectedPost &&
                format(parseISO(selectedPost.date), "MMMM d, yyyy")}
            </p>
            <p className="min-h-[200px]">{selectedPost?.content || ""}</p>
          </div>
          <DialogFooter>
            <Button>
              <CalendarCheck2 className="mr-2 h-4 w-4" />
              Reschedule Post
            </Button>
            <Button variant="destructive" onClick={handleCancelScheduledPost}>
              <Ban className="mr-2 h-4 w-4" />
              Cancel Scheduled Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
