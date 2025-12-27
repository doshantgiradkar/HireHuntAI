"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  UserCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SelectRolePage() {
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

 const handleSubmit = async () => {
  if (!selectedRole || !isLoaded) return;

  setIsLoading(true);
  setError(null);

  try {
    const res = await axios.post("/api/set-role", {
      role: selectedRole,
    });

    // ✅ Correct way to refresh Clerk session metadata
    await user.reload();

    // Redirect after reload
    window.location.href = `/${selectedRole}/dashboard`;
  } catch (err) {
    console.error(err);
    setError("Something went wrong. Please try again.");
    setIsLoading(false);
  }
};


  const roleOptions = [
    {
      id: "candidate",
      title: "Candidate",
      description: "Looking for your next career opportunity",
      icon: UserCheck,
      features: [
        "Create your professional profile",
        "Apply for jobs that match your skills",
        "Track your application status",
      ],
    },
    {
      id: "recruiter",
      title: "Recruiter",
      description: "Finding the perfect talent for your team",
      icon: Briefcase,
      features: [
        "Post job openings",
        "Manage candidate applications",
        "Conduct interviews efficiently",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-muted rounded-full">
                <Users className="h-8 w-8 text-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome to TalentHunt</CardTitle>
            <CardDescription className="text-base">
              Choose your role to get started with our platform
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedRole === option.id;

                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "relative cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                      isSelected
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:border-muted-foreground/20"
                    )}
                    onClick={() => setSelectedRole(option.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedRole(option.id);
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-6 w-6 text-foreground" />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <h3 className="text-xl font-semibold">
                          {option.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {option.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="h-1.5 w-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col items-center space-y-4 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={!selectedRole || isLoading}
                size="lg"
                className="w-full md:w-auto md:min-w-[240px]"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                    <span>Setting up...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                You can change your role anytime in settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
