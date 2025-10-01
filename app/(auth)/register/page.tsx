"use client";
import { toast } from "sonner";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterPayload, registerSchema } from "@/schemas/auth.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import supabase from "@/lib/supabase-client";
import { showErrorToast } from "@/lib/utils";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerSubmit = async (val: RegisterPayload) => {
    const { error, data } = await supabase.auth.signUp({
      email: val.email,
      password: val.password,
      options: {
        data: {
          full_name: val.fullName,
          avatar: "",
        },
      },
    });

    if (error) {
      showErrorToast(error);
    } else {
      toast.success(`${data.user?.email} is succesfully registered`);
      redirect("/login");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md sm:max-w-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-primary">
            Register to{" "}
            <span className="text-zinc-200 font-extrabold">tasky</span>.
          </CardTitle>
          <CardDescription>
            Enter your email below to log in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...registerForm}>
            <FormField
              control={registerForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="name"
                      placeholder="John Doe"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="John Doe"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Set a password"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm password"
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
            Already have an account?{" "}
            <a
              className=" text-neutral-200 underline-offset-4 hover:text-white hover:underline"
              href="/login"
            >
              Login
            </a>
          </p>
          <Button
            onClick={registerForm.handleSubmit(registerSubmit)}
            className="w-full sm:w-auto px-8"
          >
            Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
