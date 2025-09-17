import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // Get current date for welcome message
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch post statistics for the current user
  const postStats = await prisma.post.groupBy({
    by: ['status'],
    where: {
      authorId: session.user.id
    },
    _count: {
      _all: true
    }
  });

  // Calculate counts for each status
  type PostStat = { status: string; _count: { _all: number } };
  const publishedCount = postStats.find((stat: PostStat) => stat.status === 'published')?._count._all || 0;
  const draftCount = postStats.find((stat: PostStat) => stat.status === 'draft')?._count._all || 0;
  const scheduledCount = postStats.find((stat: PostStat) => stat.status === 'scheduled')?._count._all || 0;
  const totalPosts = publishedCount + draftCount + scheduledCount;

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section with Profile Details */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Profile Avatar */}
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* Welcome Message */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session?.user?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {currentDate} • Ready to create amazing content?
              </p>
            </div>
          </div>
          
          {/* Profile Info Card */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm">
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900 font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Role:</span>
                <span className="text-teal-700 font-medium">Author</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Status:</span>
                <span className="text-green-600 font-medium">● Active</span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/40">
            <div className="text-2xl font-bold text-teal-700">{publishedCount}</div>
            <div className="text-sm text-gray-600">Published Posts</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/40">
            <div className="text-2xl font-bold text-gray-700">{draftCount}</div>
            <div className="text-sm text-gray-600">Draft Posts</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/40">
            <div className="text-2xl font-bold text-blue-700">{scheduledCount}</div>
            <div className="text-sm text-gray-600">Scheduled Posts</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/40">
            <div className="text-2xl font-bold text-purple-700">{totalPosts}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Posts</h3>
              <p className="text-gray-600 text-sm">
                {totalPosts} total • {publishedCount} published • {draftCount} drafts
              </p>
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
            <div className="text-3xl">⏰</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduled</h3>
              <p className="text-gray-600 text-sm">
                {scheduledCount} posts scheduled for publication
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/posts">
              <Button className="w-full bg-teal-700 hover:bg-teal-800">
                View Scheduled
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
          <Link href="/dashboard/posts">
            <Button variant="outline" className="border-teal-700 text-teal-700 hover:bg-teal-50">
              Manage Posts
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