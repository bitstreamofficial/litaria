import { PostForm } from "@/components/posts/post-form";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600 mt-2">
          Write and publish a new blog post to share with your readers.
        </p>
      </div>

      <PostForm />
    </div>
  );
}