import { LoginForm } from "@/components/auth/login-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthErrorBoundary } from "@/components/ui/error-boundary";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if already authenticated
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthErrorBoundary>
        <LoginForm />
      </AuthErrorBoundary>
    </div>
  );
}