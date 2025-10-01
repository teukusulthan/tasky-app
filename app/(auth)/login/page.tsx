"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginPayload, loginSchema } from "@/schemas/auth.schema";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase-client";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginSubmit = async (val: LoginPayload) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email: val.email,
      password: val.password,
    });
    toast.success(`${data.user?.email} is succesfully logged in`);
    redirect("/boards");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md sm:max-w-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-primary font-bold">
            Login to <span className="text-zinc-200 font-extrabold">tasky</span>
            .
          </CardTitle>
          <CardDescription>
            Enter your email below to log in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...loginForm}>
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="enter your email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="enter your password"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <a
              className="text-zinc-200 underline-offset-4 hover:underline  "
              href="/register"
            >
              Create account
            </a>
          </p>
          <Button
            onClick={loginForm.handleSubmit(loginSubmit)}
            className="w-full sm:w-auto px-8"
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
