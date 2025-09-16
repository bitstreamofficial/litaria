"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormErrors, FieldError, SuccessMessage } from "@/components/ui/form-errors";
import { LoadingOverlay } from "@/components/ui/loading-states";
import { getErrorMessage, isNetworkError } from "@/lib/form-validation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      if (isNetworkError(error)) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <LoadingOverlay isLoading={isLoading} loadingText="Signing in...">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            {message && (
              <SuccessMessage 
                message={message} 
                className="mb-4"
              />
            )}

            {error && (
              <FormErrors 
                errors={[error]} 
                className="mb-4"
                dismissible
                onDismiss={() => setError(null)}
              />
            )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email")}
                type="email"
                id="email"
                placeholder="Enter your email"
              />
              <FieldError error={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password")}
                type="password"
                id="password"
                placeholder="Enter your password"
              />
              <FieldError error={errors.password?.message} />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </LoadingOverlay>
    </div>
  );
}