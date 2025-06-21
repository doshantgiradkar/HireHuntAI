"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const { useState, useEffect } = require("react");

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setIsVisible(scrollPosition > windowHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Ready to transform your hiring?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Start your free trial today
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Get Started Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StickyCTA;