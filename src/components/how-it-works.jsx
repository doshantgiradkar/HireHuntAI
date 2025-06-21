"use client";

import { BarChart3, Brain, Calendar, UserCheck } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "Upload Job Requirements",
      description: "Define your role requirements and ideal candidate profile"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Candidate Matching",
      description: "Our AI analyzes and ranks candidates based on job fit"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Automated Scheduling",
      description: "Seamlessly schedule interviews with integrated calendars"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Get Insights",
      description: "Receive detailed analytics and hiring recommendations"
    }
  ];

  return (
    <div className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get started in minutes with our streamlined hiring process.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-blue-600 to-purple-600 hidden lg:block"></div>
          
          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:space-x-12`}>
                <div className="flex-1 text-center lg:text-left">
                  <div className={`lg:${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Step number */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 border-4 border-blue-600 rounded-full text-blue-600 font-bold text-xl lg:mx-6 my-8 lg:my-0">
                  {index + 1}
                </div>
                
                <div className="flex-1 hidden lg:block">
                  {/* Spacer for alternating layout */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HowItWorksSection;