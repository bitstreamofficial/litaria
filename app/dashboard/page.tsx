import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session?.user?.name}! Manage your blog content from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Posts</h3>
              <p className="text-gray-600 text-sm">View and manage your blog posts</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/posts">
              <Button className="w-full bg-teal-700 hover:bg-teal-800">
                View Posts
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">➕</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">New Post</h3>
              <p className="text-gray-600 text-sm">Create a new blog post</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/posts/new">
              <Button className="w-full bg-teal-700 hover:bg-teal-800">
                Create Post
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🏷️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <p className="text-gray-600 text-sm">Manage post categories</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/categories">
              <Button className="w-full bg-teal-700 hover:bg-teal-800">
                Manage Categories
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/posts/new">
            <Button variant="outline" className="border-teal-700 text-teal-700 hover:bg-teal-50">
              Write New Post
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-teal-700 text-teal-700 hover:bg-teal-50">
              View Public Site
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}