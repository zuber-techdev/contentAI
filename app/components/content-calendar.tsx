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
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Post } from "./playground";
import SchedulePost from "./schedule-post";

interface ContentCalendarProps {
  scheduledPosts: Post[];
  handleReschedulePost: (
    requestBody: any,
    postId: string,
    reschedule: boolean
  ) => Promise<void>;
  handleCancelScheduledPost: (postId: string) => Promise<void>;
}

export default function ContentCalendar({
  scheduledPosts,
  handleReschedulePost,
  handleCancelScheduledPost,
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isContentViewerOpen, setIsContentViewerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null
  );
  const [scheduleStates, setScheduleStates] = useState<
    {
      isOpen: boolean;
      selectedDate: Date;
      currentMonth: number;
      currentYear: number;
    }[]
  >([]);

  useEffect(() => {
    const newStates = scheduledPosts.map((post) => ({
      isOpen: false,
      selectedDate: post.scheduleDate
        ? parseISO(post.scheduleDate)
        : new Date(),
      currentMonth: post.scheduleDate
        ? parseISO(post.scheduleDate).getMonth()
        : new Date().getMonth(),
      currentYear: post.scheduleDate
        ? parseISO(post.scheduleDate).getFullYear()
        : new Date().getFullYear(),
    }));
    setScheduleStates(newStates);
  }, [scheduledPosts]);

  const getPlatformColor = (
    platform: "Facebook" | "Twitter" | "LinkedIn" | "Instagram"
  ): string => {
    switch (platform) {
      case "Facebook":
        return "bg-blue-500 text-white";
      case "Twitter":
        return "bg-gray-800 text-white";
      case "LinkedIn":
        return "bg-violet-600 text-white";
      case "Instagram":
        return "bg-pink-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

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
        const dayPosts = scheduledPosts.filter((post) => {
          if (
            post.scheduleDate &&
            !post.isCanceled &&
            scheduleStates.length > 0
          )
            return isSameDay(parseISO(post.scheduleDate), cloneDay);
        });
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
                className={`mt-1 text-xs rounded p-1 truncate cursor-pointer hover:opacity-80 flex items-center ${getPlatformColor(
                  post.platform
                )}`}
                onClick={() => handleOpenContentViewer(post)}
              >
                {getPlatformIcon(post.platform)}
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

  const handleOpenContentViewer = (post: Post) => {
    const postIndex = scheduledPosts.findIndex((p) => p.id === post.id);
    setSelectedPost(post);
    setSelectedPostIndex(postIndex);
    setIsContentViewerOpen(true);
    if (postIndex !== -1 && post.scheduleDate) {
      const scheduledDate = parseISO(post.scheduleDate);
      setScheduleStates((prev) =>
        prev.map((state, index) =>
          index === postIndex
            ? {
                ...state,
                selectedDate: scheduledDate,
                currentMonth: scheduledDate.getMonth(),
                currentYear: scheduledDate.getFullYear(),
              }
            : state
        )
      );
    }
  };

  const onCancelScheduledPost = async () => {
    if (selectedPost) {
      await handleCancelScheduledPost(selectedPost.id);
      setIsContentViewerOpen(false);
    }
  };

  const onReschedulePost = async (index: number) => {
    if (selectedPost && index != -1) {
      const newScheduleDate = scheduleStates[index].selectedDate.toISOString();
      await handleReschedulePost(
        {
          content: selectedPost.content,
          scheduleDate: scheduleStates[index].selectedDate,
        },
        scheduledPosts[index].id,
        true
      );
      const newIndex = scheduledPosts.findIndex(
        (post) => post.id === selectedPost.id
      );
      setSelectedPostIndex(newIndex);
      setIsContentViewerOpen(false);
      setSelectedPost(null);
    }
  };

  const getPlatformIcon = (
    platform: "Facebook" | "Twitter" | "LinkedIn" | "Instagram"
  ) => {
    switch (platform) {
      case "Facebook":
        return <Facebook className="h-4 w-4 mb-2 " />;
      case "Twitter":
        return <Twitter className="h-4 w-4 mb-2" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 mb-2" />;
      case "Instagram":
        return <Instagram className="h-4 w-4 mb-2" />;
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
            <div className="flex flex-col mb-2 p-2 pl-0 rounded">
              {selectedPost && getPlatformIcon(selectedPost.platform)}
              <p className="text-sm text-gray-500 mb-2">
                {selectedPost &&
                  selectedPost.createdAt &&
                  `Created At: ${format(
                    parseISO(selectedPost.createdAt),
                    "MMMM d, yyyy"
                  )}`}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                {selectedPost &&
                  selectedPost.scheduleDate &&
                  `Scheduled for: ${format(
                    parseISO(selectedPost.scheduleDate),
                    "MMMM d, yyyy"
                  )}`}
              </p>
            </div>
            <p className="min-h-[200px]">{selectedPost?.content || ""}</p>
          </div>
          <DialogFooter className="sm:justify-between">
            <SchedulePost
              buttonName="Reschedule Post"
              generatedIndex={selectedPostIndex ?? -1}
              onSchedulePost={onReschedulePost}
              scheduleStates={scheduleStates}
              setScheduleStates={setScheduleStates}
            />
            <Button variant="destructive" onClick={onCancelScheduledPost}>
              <Ban className="mr-2 h-4 w-4" />
              Cancel Scheduled Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
