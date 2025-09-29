import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
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
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="name"
              id="name"
              placeholder="John Doe"
              autoComplete="given-name"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              autoComplete="john@tasky.com"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Set a password"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              type="password"
              id="confirm-password"
              placeholder="Confirm password"
              required
            />
          </div>
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
          <Button className="w-full sm:w-auto px-8">Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
