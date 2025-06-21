"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Quote } from 'lucide-react';

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = [
    {
      quote: "Agentic Interview transformed our hiring process. We've reduced time-to-hire by 60% while improving candidate quality.",
      author: "Sarah Chen",
      role: "Head of Talent",
      company: "TechCorp"
    },
    {
      quote: "The AI-powered matching is incredibly accurate. We're finding better candidates faster than ever before.",
      author: "Michael Rodriguez",
      role: "HR Director",
      company: "InnovateLabs"
    },
    {
      quote: "The automated scheduling and interview insights have streamlined our entire recruitment workflow.",
      author: "Emily Johnson",
      role: "Recruitment Manager",
      company: "GrowthCo"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto">
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50">
        <CardContent className="text-center">
          <Quote className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-6 opacity-20" />
          <blockquote className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 mb-6">
            "{testimonials[currentIndex].quote}"
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">
                {testimonials[currentIndex].author}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;