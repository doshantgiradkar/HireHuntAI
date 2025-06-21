"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Mail } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Stay Updated
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get the latest updates on AI hiring trends and product features.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex space-x-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/90 border-white/20 text-slate-900"
              required
            />
            <Button 
              type="submit" 
              className="bg-white text-blue-600 hover:bg-blue-50 transition-colors"
              disabled={isSubmitted}
            >
              {isSubmitted ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            </Button>
          </div>
        </form>
        
        {isSubmitted && (
          <p className="mt-4 text-green-200 font-medium">
            ✓ Thanks for subscribing! Check your email for confirmation.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsletterSection;