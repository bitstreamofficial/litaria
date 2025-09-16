import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/posts/post-form";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch the post
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      category: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  // Check if the user owns this post
  if (post.authorId !== session.user.id) {
    redirect("/dashboard/posts");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600 mt-2">
          Make changes to your blog post and update it for your readers.
        </p>
      </div>

      <PostForm post={post} />
    </div>
  );
}