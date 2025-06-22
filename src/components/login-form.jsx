"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}) {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const { isSignedIn } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!isLoaded) return;
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Set default role if not set
        await handleSetDefaultRole(result.user);
        window.location.href = "/dashboard";
      } else {
        setError("Check your email for a verification link.");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Login failed");
    }
    setLoading(false);
  };

  const handleOAuth = async (strategy) => {
    setOauthLoading(strategy);
    setError("");
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      // If user does not exist, create account with default role 'seeker'
      if (err.errors?.[0]?.code === 'identifier_not_found') {
        try {
          await signUp.authenticateWithRedirect({
            strategy,
            redirectUrl: "/dashboard",
            redirectUrlComplete: "/dashboard",
            additionalData: { role: "seeker" },
          });
        } catch (signupErr) {
          setError(signupErr.errors?.[0]?.message || `Sign up with ${strategy} failed`);
        }
      } else {
        setError(err.errors?.[0]?.message || `Login with ${strategy} failed`);
      }
      setOauthLoading("");
    }
  };

  // Set default role to 'seeker' after login if not already set
  const handleSetDefaultRole = async (user) => {
    if (user && !user.unsafeMetadata?.role) {
      try {
        await user.update({ unsafeMetadata: { role: "seeker" } });
      } catch (e) {
        // Optionally handle error
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your email and password or social account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => handleOAuth("oauth_google")}
                  disabled={oauthLoading === "oauth_google"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <g><path fill="#4285F4" d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.453 3.648-5.617 3.648-3.383 0-6.148-2.797-6.148-6.148s2.765-6.148 6.148-6.148c1.922 0 3.211.82 3.953 1.523l2.703-2.648c-1.727-1.602-3.953-2.602-6.656-2.602-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.703 0-.648-.07-1.148-.156-1.648z"/><path fill="#34A853" d="M3.545 7.548l3.086 2.266c.844-1.602 2.383-2.773 4.119-2.773 1.18 0 2.211.406 3.047 1.195l2.289-2.289c-1.453-1.336-3.32-2.147-5.336-2.147-3.977 0-7.211 3.234-7.211 7.211 0 1.148.258 2.234.711 3.195z"/><path fill="#FBBC05" d="M12.75 22.25c2.016 0 3.883-.672 5.336-2.148l-2.289-2.289c-.836.789-1.867 1.195-3.047 1.195-1.734 0-3.273-1.172-4.117-2.773l-3.086 2.266c1.453 2.008 3.789 3.549 6.203 3.549z"/><path fill="#EA4335" d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.453 3.648-5.617 3.648-3.383 0-6.148-2.797-6.148-6.148s2.765-6.148 6.148-6.148c1.922 0 3.211.82 3.953 1.523l2.703-2.648c-1.727-1.602-3.953-2.602-6.656-2.602-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.703 0-.648-.07-1.148-.156-1.648z"/></g>
                  </svg>
                  {oauthLoading === "oauth_google" ? "Redirecting..." : "Login with Google"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => handleOAuth("oauth_github")}
                  disabled={oauthLoading === "oauth_github"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z" fill="#181717"/></svg>
                  {oauthLoading === "oauth_github" ? "Redirecting..." : "Login with GitHub"}
                </Button>
              </div>
              <div className="relative text-center text-sm">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="user@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" placeholder="********" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div
        className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
