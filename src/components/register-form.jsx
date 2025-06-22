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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function RegisterForm({
  className,
  ...props
}) {
  const [role, setRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      alert("Please select a role.");
      return;
    }
    // ...existing email/password registration logic, set role in Clerk metadata after signup...
  };

  const handleSocialSignup = async (provider) => {
    if (!role) {
      alert("Please select a role before signing up with social.");
      return;
    }
    // ...trigger Clerk social signup, then set role in Clerk metadata after success...
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="user@example.com" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="fname">First Name</Label>
                  <Input id="fname" type="text" placeholder="Eg. John" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input id="lname" type="text" placeholder="Eg. Doe" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="newPassword">Password</Label>
                  <Input id="newPassword" type="password" placeholder="New password" required />
                  <Input id="confirmPassword" type="password" placeholder="Confirm password" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeker">Seeker</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
                <Button type="button" className="w-full" onClick={() => handleSocialSignup("google")}>Sign up with Google</Button>
                <Button type="button" className="w-full" onClick={() => handleSocialSignup("github")}>Sign up with GitHub</Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
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
