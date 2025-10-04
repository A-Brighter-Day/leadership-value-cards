import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Redirect, useLocation } from "wouter";
import * as z from "zod";

import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const AuthPage = () => {
  const { toast } = useToast();
  const { user, loginMutation } = useAuth();
  const [location] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  // If user is already logged in, redirect to admin page
  if (user) {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Form Side */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Link href="/">
                <img
                  src="/logo-extended.webp"
                  alt="A Brighter Day.Life Logo"
                  className="h-[34px]"
                />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col gap-2">
            <Link href="/">
              <Button variant="link" size="sm">
                Back to App
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Hero Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary/10 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-6">Admin Portal</h1>
          <p className="text-lg mb-8 text-muted-foreground">
            This portal allows you to manage the leadership value
            cards, view user submissions, and export data for analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
