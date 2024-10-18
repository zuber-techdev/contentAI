import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Copy, FileText, PenLine, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "./playground";
import { formatDistance } from "date-fns";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import SchedulePost from "./schedule-post";

interface PostsListProps {
  posts: Post[];
  handleUpdatePost: (requestBody: any, postId: string) => Promise<void>;
  handleDeletePost: (postId: string) => Promise<void>;
}

export default function PostsList({
  posts,
  handleUpdatePost,
  handleDeletePost,
}: PostsListProps) {
  const [editedPost, setEditedPost] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [scheduleStates, setScheduleStates] = useState<
    {
      isOpen: boolean;
      selectedDate: Date;
      currentMonth: number;
      currentYear: number;
    }[]
  >([]);
  const { user } = useAuth();

  useEffect(() => {
    const newStates = posts.map(() => ({
      isOpen: false,
      selectedDate: new Date(),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
    }));
    setScheduleStates(newStates);
  }, [posts]);

  const onSchedulePost = async (index: number) => {
    setScheduleStates((prev) =>
      prev.map((state, i) => {
        if (i === index) {
          return { ...state, isOpen: false };
        } else return state;
      })
    );
    onUpatePost(index);
  };

  const handleCopyPost = (post: Post) => {
    console.log("Post copied ", post);
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(editingPostId === post.id ? null : post.id);
    setEditedPost(editingPostId === post.id ? "" : post.content);
  };

  const onUpatePost = async (index?: number) => {
    const postToUpdate =
      index !== undefined
        ? posts[index]
        : posts.find((post) => post.id === editingPostId);
    if (!postToUpdate) throw new Error("Post not found");
    if (editingPostId)
      await handleUpdatePost(
        {
          topic: postToUpdate.topic,
          industry: postToUpdate.industry,
          tone: postToUpdate.tone,
          platform: postToUpdate.platform,
          content: editedPost,
        },
        editingPostId
      );
    else if (index !== undefined)
      await handleUpdatePost(
        {
          content: postToUpdate.content,
          scheduleDate: scheduleStates[index].selectedDate,
          isCanceled: false,
        },
        posts[index].id
      );
    setEditedPost("");
    setEditingPostId(null);
  };

  const onDeletePost = async (postId: string) => {
    await handleDeletePost(postId);
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>No posts available. Generate your first post!</p>
          </CardContent>
        </Card>
      ) : (
        scheduleStates.length > 0 &&
        posts.map((post, index) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex flex-row-reverse justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyPost(post)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPost(post)}
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpatePost()}
                          disabled={editingPostId !== post.id}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => onDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center mb-2">
                  <span
                    className={`w-12 h-12 rounded-full mr-4
                      //  flex items-center justify-center overflow-hidden 
                       ${
                         !user?.profileImage || user.profileImage.length === 0
                           ? "bg-pink-500"
                           : ""
                       }`}
                  >
                    {user?.profileImage && user.profileImage.length > 0 ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </span>
                  <div>
                    <div className="flex space-x-2 items-center">
                      <h3 className="font-bold">{user?.name}</h3>
                      {!post.scheduleDate || post.isCanceled === true ? (
                        <Badge variant="destructive">Unscheduled</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500">
                      • {formatDistance(new Date(), post.createdAt)} ago
                    </p>
                  </div>
                </div>
                <p className="mb-2">{post.topic}</p>
                {editingPostId === post.id ? (
                  <Textarea
                    value={editedPost}
                    onChange={(e) => {
                      setEditedPost(e.target.value);
                    }}
                    className="min-h-[200px] mb-2"
                  />
                ) : (
                  <p className="mb-2">{post.content}</p>
                )}
              </div>
              <div className="flex flex-row-reverse">
                {(!post.scheduleDate || post.isCanceled) && (
                  <SchedulePost
                    buttonName="Schedule"
                    generatedIndex={index}
                    scheduleStates={scheduleStates}
                    setScheduleStates={setScheduleStates}
                    onSchedulePost={onSchedulePost}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
