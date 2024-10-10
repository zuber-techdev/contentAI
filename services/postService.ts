import Post, {IPost} from '../models/post';

// Create a new post
export async function createPost(userId: string, topic: string, industry: string, tone: string, platform: string, scheduleDate: Date, content: string) {
  const newPost = new Post({
    userId,
    topic,
    industry,
    tone,
    platform,
    scheduleDate,
    content,
  });

  await newPost.save();
  return newPost;
}

// Get all posts for a user
export async function getAllPostsByUserId(userId: string) {
  return await Post.find({ userId });
}

// Update a post by post ID
export async function updatePost(postId: string, updatedData: Partial<IPost>) {
  const post = await Post.findByIdAndUpdate(postId, updatedData, { new: true });
  if (!post) {
    throw new Error('Post not found');
  }
  return post;
}

// Delete a post by post ID
export async function deletePost(postId: string) {
  const post = await Post.findByIdAndDelete(postId);
  if (!post) {
    throw new Error('Post not found');
  }
  return post;
}

export async function cancelPostSchedule(postId: string) {
  const post = await Post.findByIdAndUpdate(postId, {isCanceled: true}, { new: true });
  if (!post) {
    throw new Error('Post not found');
  }
  return post;
}
