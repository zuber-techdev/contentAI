import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useAuth } from "../contexts/auth-context";
import SchedulePost from "./schedule-post";

interface GeneratePostProps {
  handleSavePost: (requestBody: any) => Promise<void>;
  topics: string[];
  handleGenerateTopics: () => Promise<void>;
  handleGeneratePost: (requestBody: any) => Promise<{ post: string }[]>;
}

export default function GeneratePost({
  handleSavePost,
  topics,
  handleGenerateTopics,
  handleGeneratePost,
}: GeneratePostProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [noOfPosts, setNoOfPosts] = useState(1);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<{ post: string }[]>([]);
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
    const newStates = generatedPosts.map(() => ({
      isOpen: false,
      selectedDate: new Date(),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
    }));
    setScheduleStates(newStates);
  }, [generatedPosts]);

  const onSchedulePost = (index: number) => {
    setScheduleStates((prev) =>
      prev.map((state, i) =>
        i === index ? { ...state, isOpen: false } : state
      )
    );
    onSavePost(generatedPosts[index].post, scheduleStates[index].selectedDate);
  };

  const onSavePost = async (generatedPost: string, scheduleDate?: Date) => {
    try {
      await handleSavePost({
        topic: selectedTopic,
        industry: selectedIndustry,
        tone: selectedTone,
        platform: selectedPlatform,
        scheduleDate,
        generatedPost,
      });
      const updatedPosts = generatedPosts.filter(
        (currentPost) => currentPost.post !== generatedPost
      );
      setGeneratedPosts(updatedPosts);
      if (updatedPosts.length === 0) {
        setSelectedTopic("");
        setSelectedIndustry("");
        setSelectedTone("");
        setSelectedPlatform("");
      }
    } catch (err) {
      console.error("Error saving post: ", err);
    }
  };

  const onGenerateTopics = async () => {
    setIsGeneratingTopics(true);
    await handleGenerateTopics();
    setIsGeneratingTopics(false);
  };

  const onGeneratePost = async () => {
    setIsGeneratingPost(true);
    const posts = await handleGeneratePost({
      topic: selectedTopic,
      industry: selectedIndustry,
      tone: selectedTone,
      platform: selectedPlatform,
      noOfPosts,
    });
    setGeneratedPosts(posts);
    setIsGeneratingPost(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            What would you like to post?
          </h2>
          <Tabs
            defaultValue="topic"
            onValueChange={() => setGeneratedPosts([])}
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
                <div className="w-full sm:w-2/3 content-center text-center">
                  {topics.length > 0 ? (
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
                  ) : (
                    <p>No topic suggestions exist yet.</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={onGenerateTopics}
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
                  onChange={(event) => setSelectedIndustry(event.target.value)}
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
                  onChange={(event) => setSelectedTone(event.target.value)}
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
                  onChange={(event) => setSelectedTopic(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="postType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type of Post
                </label>
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger id="postType">
                    <SelectValue placeholder="Choose a post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="social">Social Media Post</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex items-center space-x-2">
            <Input
              type="number"
              min="1"
              value={noOfPosts}
              onChange={(e) => setNoOfPosts(parseInt(e.target.value))}
              className="w-20"
            />
            <span>Number of posts to generate</span>
          </div>
          <Button
            className="w-full mt-4 bg-pink-500 hover:bg-pink-600"
            onClick={onGeneratePost}
            disabled={isGeneratingPost}
          >
            {isGeneratingPost && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate Post
          </Button>
        </CardContent>
      </Card>
      {generatedPosts &&
        scheduleStates.length > 0 &&
        generatedPosts.map((generatedPost, generatedIndex) => (
          <Card key={generatedIndex} className="mt-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 bg-pink-500 rounded-full">
                    {user?.profileImage && user.profileImage.length > 0 ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={500}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={"/uploads/person.png"}
                        alt="Profile"
                        width={500}
                        height={300}
                      />
                    )}
                  </span>
                  <span className="font-semibold">AI Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSavePost(generatedPost.post)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <SchedulePost
                    buttonName="Schedule"
                    onSchedulePost={onSchedulePost}
                    generatedIndex={generatedIndex}
                    scheduleStates={scheduleStates}
                    setScheduleStates={setScheduleStates}
                  />
                </div>
              </div>
              <Textarea
                className="min-h-[200px]"
                value={generatedPost.post}
                onChange={(e) => {
                  setGeneratedPosts(
                    generatedPosts.map((post, index) => {
                      if (index === generatedIndex) post.post = e.target.value;
                      return post;
                    })
                  );
                }}
              />
            </CardContent>
          </Card>
        ))}
    </>
  );
}
