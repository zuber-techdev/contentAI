"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckoutButton from "@/components/ui/CheckoutButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  PenLine,
  FileText,
  LogOut,
  Loader2,
  Settings,
  Camera,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { authFetch } from "../utils/authFetch";
import { getRelativeTime } from "../utils/dateUtils";

type TabTypes = "generate" | "posts" | "settings";

const stripePublicKey = "price_1Q7AktG8swv4YdckPdweLEZB";

type Post = {
  id: string;
  userId: string;
  content: string;
  topic: string;
  industry: string;
  tone: string;
  platform: string;
  createdAt: string;
};

type ProfileSettings = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function Playground() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [generatedPost, setGeneratedPost] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [activeTab, setActiveTab] = useState<TabTypes>("generate");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedPost, setEditedPost] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [persona, setPersona] = useState("");
  const [personaString, setPersonaString] = useState("");
  const [isEditingPersona, setIsEditingPersona] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchPersona();
    if (user) {
      setProfileSettings({
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ")[1] || "",
        email: user.email,
      });
    }
  }, []);

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
            _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
          }) => ({
            id: _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
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

  const fetchPersona = async () => {
    try {
      const response = await authFetch("/api/digital-persona");
      if (!response.ok) {
        throw new Error("Error fetching persona details");
      }
      const personaDetails = await response.json();
      setPersona(personaDetails.personaData);
      setPersonaString(personaDetails.personaData);
    } catch (err) {
      console.error("Error fetching persona details", err);
      toast({
        title: "Error",
        description: "Failed to fetch persona details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createPost = async () => {
    try {
      const response = await authFetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          industry: selectedIndustry,
          tone: selectedTone,
          platform: selectedPlatform,
          generatedPost,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      const newPost = await response.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setGeneratedPost("");
      setSelectedTopic("");
      setSelectedIndustry("");
      setSelectedTone("");
      setSelectedPlatform("");
      toast({
        title: "Post created",
        description: "Your post has been successfully created and saved.",
      });
    } catch (err) {
      console.error("Error creating post", err);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTopics = async () => {
    try {
      setIsGeneratingTopics(true);
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
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const handleGeneratePost = async () => {
    try {
      setIsGeneratingPost(true);

      const response = await authFetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          industry: selectedIndustry,
          tone: selectedTone,
          platform: selectedPlatform,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate post");
      }
      const data = await response.json();
      setGeneratedPost(data.post);
    } catch (err) {
      console.error("Error generating post: ", err);
      toast({
        title: "Error",
        description: "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(editingPostId === post.id ? null : post.id);
    setEditedPost(editingPostId === post.id ? "" : post.content);
  };

  const handleSavePost = async (postId: string) => {
    try {
      const postToUpdate = posts.find((post) => post.id === postId);
      if (!postToUpdate) throw new Error("Post not found");

      const response = await authFetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: postToUpdate.topic,
          industry: postToUpdate.industry,
          tone: postToUpdate.tone,
          platform: postToUpdate.platform,
          content: editedPost,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      const updatedPost = await response.json();
      const { userId, content, topic, industry, platform, tone } = updatedPost;
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
              }
            : post
        )
      );

      setEditedPost("");
      setEditingPostId(null);
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated.",
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

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileSettings({
      firstName: user?.name.split(" ")[0] || "",
      lastName: user?.name.split(" ")[1] || "",
      email: user?.email || "",
    });
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleProfileSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPersona = () => {
    setIsEditingPersona(true);
  };

  const handleCancelEditPersona = () => {
    setIsEditingPersona(false);
  };

  const handleSavePersona = async () => {
    try {
      const response = await authFetch("/api/digital-persona", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personaData: personaString }),
      });

      if (!response.ok) {
        throw new Error("Failed to save persona");
      }
      const updatedPersona = await response.json();
      setPersona(updatedPersona.personaData);
      setPersonaString(updatedPersona.personaData);
    } catch (err) {
      console.error("Error updating persona", err);
      toast({
        title: "Error",
        description: "Failed to update persona. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <span className="w-8 h-8 bg-pink-500 rounded-md mr-2 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </span>
            {user?.name}
          </h2>
        </div>
        <CheckoutButton priceId={stripePublicKey}></CheckoutButton>
        <nav className="p-4">
          <Button
            variant={activeTab === "generate" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => {
              setActiveTab("generate");
              setEditingPostId(null);
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
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {activeTab === "generate" ? "Generate Post" : "Posts"}
          </h1>
          <div className="flex items-center space-x-4"></div>
        </header>

        <main className="p-6 space-y-8">
          {activeTab === "generate" && (
            <Card className="w-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  What would you like to post?
                </h2>
                <Tabs
                  defaultValue="topic"
                  onValueChange={() => setGeneratedPost("")}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="topic" className="flex-1">
                      Topic Suggestion
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">
                      Custom Topic
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="topic" className="space-y-4">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="w-full sm:w-2/3">
                        <Select
                          value={selectedTopic}
                          onValueChange={setSelectedTopic}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics.map((topic, index) => (
                              <SelectItem key={index} value={topic}>
                                {topic}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleGenerateTopics}
                        disabled={isGeneratingTopics}
                        className="w-full sm:w-1/3"
                      >
                        {isGeneratingTopics && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Generate Topic Ideas
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <label
                        htmlFor="industry"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Industry
                      </label>
                      <Input
                        id="industry"
                        value={selectedIndustry}
                        onChange={(event) =>
                          setSelectedIndustry(event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="niche"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Niche
                      </label>
                      <Input
                        id="niche"
                        value={selectedTone}
                        onChange={(event) =>
                          setSelectedTone(event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="topicType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Topic Type
                      </label>
                      <Input
                        id="topicType"
                        value={selectedTopic}
                        onChange={(event) =>
                          setSelectedTopic(event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Type of Post
                      </label>
                      <Select>
                        <SelectTrigger id="postType">
                          <SelectValue placeholder="Choose a post type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">Blog Post</SelectItem>
                          <SelectItem value="social">
                            Social Media Post
                          </SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
                <Button
                  className="w-full mt-4 bg-pink-500 hover:bg-pink-600"
                  onClick={handleGeneratePost}
                  disabled={isGeneratingPost}
                >
                  {isGeneratingPost && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Post
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p>No posts available. Generate your first post!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
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
                                  onClick={() => handleSavePost(post.id)}
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
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  <LogOut className="h-4 w-4" />
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
                          <div className="w-12 h-12 bg-pink-500 rounded-full mr-4"></div>
                          <div>
                            <h3 className="font-bold">{user?.name}</h3>
                            <p className="text-sm text-gray-500">
                              • {getRelativeTime(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="mb-2">{post.topic}</p>
                        <p className="mb-2">{post.content}</p>
                        {/* <p className="text-sm text-blue-500 mb-2">...see more</p> */}
                        {/* <div className="flex justify-between text-sm text-gray-500">
                        <span>1.2k likes</span>
                        <span>215 comments • 19 reposts</span>
                      </div> */}
                      </div>
                      {editingPostId === post.id ? (
                        <div className="mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
                            <span className="font-semibold">AI Generated</span>
                          </div>
                          <Textarea
                            value={editedPost}
                            onChange={(e) => {
                              setEditedPost(e.target.value);
                            }}
                            className="min-h-[200px] mb-2"
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    Profile Settings
                    {!isEditingProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditProfile}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div
                      className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                    <div className="flex items-center space-x-2">
                      <Button onClick={triggerFileInput}>
                        {profileImage ? "Change Image" : "Upload Image"}
                      </Button>
                      {profileImage && (
                        <Button
                          variant="destructive"
                          onClick={removeProfileImage}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                  <form className="space-y-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name
                      </label>
                      {isEditingProfile ? (
                        <Input
                          id="firstName"
                          name="firstName"
                          value={profileSettings.firstName}
                          onChange={handleProfileSettingsChange}
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profileSettings.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name
                      </label>
                      {isEditingProfile ? (
                        <Input
                          id="lastName"
                          name="lastName"
                          value={profileSettings.lastName}
                          onChange={handleProfileSettingsChange}
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profileSettings.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      {isEditingProfile ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileSettings.email}
                          onChange={handleProfileSettingsChange}
                        />
                      ) : (
                        <p className="text-gray-900">{profileSettings.email}</p>
                      )}
                    </div>
                    {/* <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        // value={profileSettings.password}
                        // onChange={handleProfileSettingsChange}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        // value={profileSettings.confirmPassword}
                        // onChange={handleProfileSettingsChange}
                        placeholder="Confirm new password"
                      />
                    </div> */}
                    {isEditingProfile && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-pink-500 hover:bg-pink-600"
                        >
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancelEditProfile}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Persona Settings
                    {!isEditingPersona && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditPersona}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditingPersona ? (
                    <Textarea
                      value={personaString}
                      onChange={(e) => setPersonaString(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Describe your professional persona..."
                    />
                  ) : (
                    <p className="text-gray-900">{persona}</p>
                  )}
                  {isEditingPersona && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleSavePersona()}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        Save Persona
                      </Button>
                      <Button
                        onClick={handleCancelEditPersona}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {generatedPost && activeTab === "generate" && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
                    <span className="font-semibold">AI Generated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={createPost}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Textarea
                  value={generatedPost}
                  onChange={(e) => setGeneratedPost(e.target.value)}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
