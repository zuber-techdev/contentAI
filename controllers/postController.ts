import { NextApiRequest, NextApiResponse } from "next";
import { generatePost, generatePostTopics } from "../services/openAIService";
import {
  createPost,
  getAllPostsByUserId,
  updatePost,
  deletePost,
} from "../services/postService";
import { storeCustomTopics, getCustomTopics } from "../services/topicService";
import connectToDatabase from "../lib/mongodb";

// Handler to generate digital persona
export async function generatePostHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      connectToDatabase();
      const { userId } = req.user as { userId: string };

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized, no userId found in token" });
      }
      const { topic } = req.body;
      const industry = req.body.industry || "";
      const tone = req.body.tone || "";
      const platform = req.body.platform || "";
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      const post = await generatePost(userId, topic, industry, tone, platform);
      res.status(200).json({ post });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

// Handler to create a new post
export async function createPostHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      await connectToDatabase();
      const { userId } = req.user as { userId: string };

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized, no userId found in token" });
      }
      const { topic, generatedPost } = req.body;
      const industry = req.body.industry || "";
      const tone = req.body.tone || "";
      const platform = req.body.platform || "";

      if (!topic || !generatedPost) {
        return res
          .status(400)
          .json({ message: "generatedPost, topic, are required" });
      }
      const post = await createPost(
        userId,
        topic,
        industry,
        tone,
        platform,
        generatedPost
      );
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getPostsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectToDatabase();

      const { userId } = req.user as { userId: string };

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized, no userId found in token" });
      }

      const posts = await getAllPostsByUserId(userId as string);

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function updatePostHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    try {
      await connectToDatabase();

      const { postId } = req.query;
      const updatedData = req.body;

      const post = await updatePost(postId as string, updatedData);

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function deletePostHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      await connectToDatabase();

      const { postId } = req.query;

      const post = await deletePost(postId as string);

      res.status(200).json({ message: "Post deleted successfully", post });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function generatePostTopicsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectToDatabase();

      const { userId } = req.user as { userId: string };

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized, no userId found in token" });
      }
      const response: any = await generatePostTopics(userId);

      const topics = extractTopicsFromResponse(response);
      await storeCustomTopics(userId, topics);
      res.status(200).json({ topics });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export async function getPostTopicsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectToDatabase();

      const { userId } = req.user as { userId: string };

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized, no userId found in token" });
      }
      const topics: any = await getCustomTopics(userId);

      res.status(200).json({ topics });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

function extractTopicsFromResponse(response: string): string[] {
  const jsonStart = response.indexOf("[");
  const jsonEnd = response.lastIndexOf("]") + 1;

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Invalid response format");
  }
  const jsonArrayString = response.slice(jsonStart, jsonEnd);

  try {
    const topicsArray = JSON.parse(jsonArrayString);
    return topicsArray;
  } catch (error) {
    throw new Error("Error parsing topics from response");
  }
}
