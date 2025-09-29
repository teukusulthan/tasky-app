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
          <CardTitle className="text-2xl text-primary font-bold">
            Login to
          </CardTitle>
          <CardDescription>
            Enter your email below to log in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <a
              className="text-zinc-200 underline-offset-4 hover:underline hover:underline "
              href="/auth/register"
            >
              Create account
            </a>
          </p>
          <Button className="w-full sm:w-auto px-8">Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
