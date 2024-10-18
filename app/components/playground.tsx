"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  FileText,
  LogOut,
  Loader2,
  Settings,
  CalendarIcon,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { authFetch } from "../utils/authFetch";
import Image from "next/image";
import ProfileSettings from "./profile-settings";
import GeneratePost from "./generate-post";
import PostsList from "./posts-list";
import { toast } from "@/hooks/use-toast";
import ContentCalendar from "./content-calendar";
import { useRouter } from "next/navigation";
import PricingPlan from "./pricing-plan";

type TabTypes = "generate" | "posts" | "settings" | "calendar" | "subscribe";

export type Post = {
  id: string;
  userId: string;
  content: string;
  topic: string;
  industry: string;
  tone: string;
  platform: "Facebook" | "Twitter" | "LinkedIn" | "Instagram";
  createdAt: string;
  scheduleDate?: string;
  isCanceled?: boolean;
};

export default function Playground() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [persona, setPersona] = useState("");
  const [activeTab, setActiveTab] = useState<TabTypes>("generate");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );

  const { user, logout, updateUserProfileImage, updateUserToken } = useAuth();

  useEffect(() => {
    if (posts.length === 0) fetchPosts();
    if (topics.length === 0) fetchTopics();
    if (persona.length === 0) fetchPersona();
    getSubscriptionStatus();
  }, []);

  const getSubscriptionStatus = async () => {
    try {
      const response = await authFetch("/api/subscription-status");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }
      const data = await response.json();
      setSubscriptionStatus(data.status);
    } catch (err) {
      console.error("Error fetching subscription status", err);
      toast({
        title: "Error",
        description: "Failed to fetch subscription status. Please try again.",
        variant: "destructive",
      });
    }
  };
  const fetchTopics = async () => {
    try {
      const response = await authFetch("/api/get-custom-topics");
      if (!response.ok) {
        throw new Error("Failed to fetch custom topics");
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (err) {
      setError(
        "An error occurred while fetching questions. Please try again later."
      );
      console.error("Error fetching posts", err);
    }
  };

  const handleGenerateTopics = async () => {
    try {
      const response = await authFetch("/api/generate-post-topics");
      if (!response.ok) {
        throw new Error("Failed to generate topic ideas");
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (err) {
      console.error("Error fetching topic ideas", err);
      toast({
        title: "Error",
        description: "Failed to generate topic ideas. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePost = async (requestBody: any) => {
    try {
      const response = await authFetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const data = await response.json();
      return data.posts;
    } catch (err) {
      console.error("Error generating post: ", err);
      toast({
        title: "Error",
        description: `${err}. Failed to generate post. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleSavePost = async (requestBody: any) => {
    try {
      const response = await authFetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const {
        content,
        createdAt,
        industry,
        platform,
        topic,
        tone,
        _id,
        userId,
        scheduleDate,
        isCanceled,
      } = await response.json();
      setPosts((prevPosts) => [
        ...prevPosts,
        {
          id: _id,
          content,
          createdAt,
          industry,
          platform,
          tone,
          topic,
          userId,
          scheduleDate,
          isCanceled,
        },
      ]);
      toast({
        title: "Post created",
        description: scheduleDate
          ? "Your post has been successfully scheduled."
          : "Your post has been successfully created and saved.",
      });
    } catch (err) {
      console.error("Error creating post", err);
      toast({
        title: "Error",
        description: err + "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await authFetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(
        data.map(
          ({
            id: _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
            scheduleDate,
            isCanceled,
          }: Post) => ({
            id: _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
            scheduleDate,
            isCanceled,
          })
        )
      );
    } catch (err) {
      setError(
        "An error occurred while fetching questions. Please try again later."
      );
      console.error("Error fetching posts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async (
    requestBody: any,
    editingPostId: string,
    reschedule?: boolean
  ) => {
    try {
      const response = await authFetch(`/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      const updatedPost = await response.json();
      const {
        userId,
        content,
        topic,
        industry,
        platform,
        tone,
        createdAt,
        scheduleDate,
        isCanceled,
      } = updatedPost;
      setPosts(
        posts.map((post) =>
          post.id === updatedPost._id
            ? {
                id: updatedPost._id,
                userId,
                content,
                tone,
                topic,
                industry,
                platform,
                createdAt,
                scheduleDate,
                isCanceled,
              }
            : post
        )
      );
      toast({
        title: reschedule ? "Post rescheduled." : "Post updated.",
        description: reschedule
          ? "Your post has been successfully rescheduled."
          : "Your post has been successfully updated.",
      });
    } catch (err) {
      console.error("Error updating post", err);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await authFetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }
      setPosts(posts.filter((post) => post.id !== postId));
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (err) {
      console.error("Error deleting post", err);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelScheduledPost = async (postId: string) => {
    try {
      const response = await authFetch(`/api/cancel-post-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const updatedPost = await response.json();
      const {
        userId,
        content,
        topic,
        industry,
        platform,
        tone,
        createdAt,
        scheduleDate,
        isCanceled,
      } = updatedPost.post;
      setPosts(
        posts.map((post) =>
          post.id === updatedPost.post._id
            ? {
                id: updatedPost.post._id,
                userId,
                content,
                tone,
                topic,
                industry,
                platform,
                createdAt,
                scheduleDate,
                isCanceled,
              }
            : post
        )
      );
      toast({
        title: "Post canceled",
        description: "Your scheduled post has been successfully canceled.",
      });
    } catch (err) {
      console.error("Error canceling scheduled post", err);
      toast({
        title: "Error",
        description: err + "Failed to cancel scheduled post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPersona = async () => {
    try {
      const response = await authFetch("/api/digital-persona");
      if (!response.ok) {
        throw new Error("Error fetching persona details");
      }
      const personaDetails = await response.json();
      setPersona(personaDetails.personaData);
    } catch (err) {
      console.error("Error fetching persona details", err);
      toast({
        title: "Error",
        description: "Failed to fetch persona details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async (formData: FormData) => {
    try {
      const response = await authFetch("/api/update-user-profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      updateUserToken(data.token);
      updateUserProfileImage(data.profileImage);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      return { status: "success", data };
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: err + ". Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return { status: "failure", data: err };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <span
              className={`w-8 h-8 rounded-md mr-2 flex items-center justify-center overflow-hidden ${
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
            {user?.name}
          </h2>
        </div>
        <nav className="p-4">
          <Button
            variant={activeTab === "generate" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => {
              setActiveTab("generate");
            }}
          >
            <PenLine className="mr-2 h-4 w-4" /> Generate Post
          </Button>
          <Button
            variant={activeTab === "posts" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => setActiveTab("posts")}
          >
            <FileText className="mr-2 h-4 w-4" /> Posts
          </Button>
          <Button
            variant={activeTab === "calendar" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => setActiveTab("calendar")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 pb-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {activeTab === "generate"
              ? "Generate Post"
              : activeTab === "posts"
              ? "Posts"
              : activeTab === "calendar"
              ? "Calendar"
              : activeTab === "settings"
              ? "Settings"
              : "Subscribe"}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {subscriptionStatus === "active"
                ? "Upgraded to Pro"
                : "Free Trial"}
            </div>
            {subscriptionStatus !== "active" ? (
              <Button
                variant="default"
                className="bg-pink-500 hover:bg-pink-600"
                onClick={() => setActiveTab("subscribe")}
              >
                Upgrade to Pro
              </Button>
            ) : null}
          </div>
        </header>
        <main className="p-6 space-y-8">
          {activeTab === "generate" && (
            <GeneratePost
              handleSavePost={handleSavePost}
              handleGenerateTopics={handleGenerateTopics}
              handleGeneratePost={handleGeneratePost}
              topics={topics}
            />
          )}

          {activeTab === "posts" && (
            <PostsList
              posts={posts}
              handleUpdatePost={handleUpdatePost}
              handleDeletePost={handleDeletePost}
            />
          )}

          {activeTab === "calendar" && (
            <ContentCalendar
              scheduledPosts={posts}
              handleReschedulePost={handleUpdatePost}
              handleCancelScheduledPost={handleCancelScheduledPost}
            />
          )}

          {activeTab === "settings" && (
            <ProfileSettings
              persona={persona}
              handleSaveProfile={handleSaveProfile}
              handleUpdatePersona={setPersona}
            />
          )}

          {activeTab === "subscribe" && (
            <PricingPlan
              parent={true}
              handleCancel={() => setActiveTab("generate")}
            />
          )}
        </main>
      </div>
    </div>
  );
}
