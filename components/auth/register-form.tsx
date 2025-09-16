"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormErrors, FieldError } from "@/components/ui/form-errors";
import { LoadingOverlay } from "@/components/ui/loading-states";
import { handleAPIError, getErrorMessage, isNetworkError } from "@/lib/form-validation";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = handleAPIError(response, result);
        throw new Error(errorMessage);
      }

      // Registration successful, redirect to login
      router.push("/login?message=Registration successful. Please log in.");
    } catch (error) {
      console.error("Registration error:", error);
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
      <LoadingOverlay isLoading={isLoading} loadingText="Creating account...">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <Label htmlFor="name">Name</Label>
              <Input
                {...register("name")}
                type="text"
                id="name"
                placeholder="Enter your name"
              />
              <FieldError error={errors.name?.message} />
            </div>

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
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </LoadingOverlay>
    </div>
  );
}