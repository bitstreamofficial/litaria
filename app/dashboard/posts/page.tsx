import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PostsManagement } from "@/components/dashboard/posts-management";

export default async function PostsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-2">
            Manage your blog posts, edit content, and track performance.
          </p>
        </div>
      </div>

      <PostsManagement userId={session.user.id} />
    </div>
  );
}