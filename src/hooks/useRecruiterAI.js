import { useState, useCallback } from "react";

/**
 * Hook to manage AI chatbot panel state and context
 * @param {string} pageType - Type of page (dashboard, analytics, candidate, job, discover)
 * @returns {Object} - Chatbot state and methods
 */
export const useRecruiterAI = (pageType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState(null);

  const openPanel = useCallback((data) => {
    setContextData(data);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    // Clear context after animation completes
    setTimeout(() => setContextData(null), 300);
  }, []);

  const updateContext = useCallback((data) => {
    setContextData(data);
  }, []);

  return {
    isOpen,
    contextData,
    openPanel,
    closePanel,
    updateContext,
    pageType,
  };
};

export default useRecruiterAI;
