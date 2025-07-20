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
  Search,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

// Utility function for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
  if (!selectedRole) return;
  setIsLoading(true);
  setError(null);

  try {
    const res = await axios.post("/api/set-role", {
      role: selectedRole,
    });

    // Axios only reaches here if the request was successful
    if (res.status === 200) {
      window.location.href = `/${selectedRole}/dashboard`;
    }
  } catch (err) {
    console.error(err); // Optional: log the error for debugging
    setError("Something went wrong. Please try again.");
    setIsLoading(false);
  }
};

  const roleOptions = [
    {
      id: "candidate",
      title: "Job Seeker",
      description: "Looking for your next career opportunity",
      icon: UserCheck,
      features: [
        "Create your professional profile",
        "Get matched with relevant jobs",
        "Track application status",
        "Receive personalized recommendations",
      ],
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:border-green-300",
    },
    {
      id: "recruiter",
      title: "Recruiter",
      description: "Finding the perfect talent for your team",
      icon: Briefcase,
      features: [
        "Post job openings",
        "AI-powered candidate matching",
        "Streamlined interview process",
        "Advanced filtering & search",
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-300",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Welcome to TalentHunt
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Choose your role to get started with our AI-powered recruitment
              platform
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedRole === option.id;

                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                      option.borderColor,
                      option.hoverColor,
                      isSelected && "ring-2 ring-primary shadow-md"
                    )}
                    onClick={() => setSelectedRole(option.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("p-3 rounded-lg", option.bgColor)}>
                          <Icon className={cn("h-6 w-6", option.color)} />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <h3 className="text-xl font-semibold text-foreground">
                          {option.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {option.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {option.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-muted/50 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    AI-Powered Matching
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Smart algorithms for perfect matches
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Intelligent Screening
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Automated candidate evaluation
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Seamless Process
                  </span>
                  <span className="text-xs text-muted-foreground">
                    End-to-end hiring solution
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Button
                onClick={handleSubmit}
                disabled={!selectedRole || isLoading}
                size="lg"
                className="w-full md:w-auto min-w-[200px] h-12"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Setting up...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                You can change your role anytime in account settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
