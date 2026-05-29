/**
 * Shortlisting Logic for Automated Candidate Selection
 * 
 * This module contains the core logic for shortlisting candidates based on:
 * 1. Hard filter: ATS score >= 70
 * 2. 1.5x multiplier on job openings
 * 3. Sorting by matchScore in descending order
 */

/**
 * Calculate the number of candidates to shortlist
 * @param {number} openings - Number of job openings
 * @returns {number} Target count for shortlisting (1.5x openings, ceiling)
 */
export function calculateTargetCount(openings) {
  return Math.ceil(openings * 1.5);
}

/**
 * Main shortlisting function - selects top candidates based on criteria
 * 
 * @param {object} params - Parameters object
 * @param {number} params.openings - Number of job openings required
 * @param {array} params.applications - Array of application documents with eligibility scores
 * @returns {object} { shortlistedCandidates, rejectedCandidates, shortlistCount, totalEligible }
 * 
 * @example
 * const result = shortlistCandidates({
 *   openings: 5,
 *   applications: [...applications from DB]
 * });
 * // Returns candidates sorted by matchScore (highest first)
 */
export function shortlistCandidates({ openings, applications }) {
  if (!applications || applications.length === 0) {
    return {
      shortlistedCandidates: [],
      rejectedCandidates: [],
      shortlistCount: 0,
      totalEligible: 0,
      reason: "No applications found"
    };
  }

  // Step 1: Apply hard filter - ATS score >= 70
  const eligibleCandidates = applications.filter(app => {
    const atsScore = app.eligibility?.atsScore || 0;
    return atsScore >= 70;
  });

  if (eligibleCandidates.length === 0) {
    return {
      shortlistedCandidates: [],
      rejectedCandidates: applications,
      shortlistCount: 0,
      totalEligible: 0,
      reason: "No candidates meet ATS score requirement (>= 70)"
    };
  }

  // Step 2: Calculate target count (1.5x openings)
  const targetCount = calculateTargetCount(openings);

  // Step 3: Sort by matchScore in descending order
  const sortedCandidates = eligibleCandidates.sort((a, b) => {
    const scoreA = a.eligibility?.matchScore || 0;
    const scoreB = b.eligibility?.matchScore || 0;
    return scoreB - scoreA; // Descending order (highest first)
  });

  // Step 4: Select top candidates based on target count
  // If eligible candidates < targetCount, select all eligible candidates
  const actualCount = Math.min(targetCount, eligibleCandidates.length);
  const shortlistedCandidates = sortedCandidates.slice(0, actualCount);

  // Step 5: Mark remaining as rejected (didn't make the cut)
  const rejectedCandidates = sortedCandidates.slice(actualCount);
  
  // Also include non-eligible candidates (failed ATS filter) in rejected
  const allRejected = [
    ...rejectedCandidates,
    ...applications.filter(app => !(eligibleCandidates.includes(app)))
  ];

  return {
    shortlistedCandidates,
    rejectedCandidates: allRejected,
    shortlistCount: shortlistedCandidates.length,
    totalEligible: eligibleCandidates.length,
    targetCount,
    reason: "Shortlisting completed successfully"
  };
}

/**
 * Transform shortlisted candidates to interview candidate format
 * 
 * @param {array} candidates - Array of shortlisted application documents
 * @returns {array} Array of candidates formatted for interview creation
 * 
 * @example
 * const interviewCandidates = transformToInterviewFormat(shortlistedCandidates);
 * // Returns: [{ candidateId, matchScore, feedback, interviewScore }, ...]
 */
export function transformToInterviewFormat(candidates) {
  return candidates.map(app => ({
    candidateId: app.candidateClerkId,
    matchScore: app.eligibility?.matchScore || 0,
    feedback: "",
    interviewScore: 0,
  }));
}

/**
 * Validate if shortlisting is possible for a job
 * 
 * @param {object} job - Job document from database
 * @param {array} applications - Array of applications for the job
 * @returns {object} { isValid, message }
 */
export function validateShortlistingPossible(job, applications) {
  if (!job) {
    return { isValid: false, message: "Job not found" };
  }

  if (!job.openings || job.openings <= 0) {
    return { isValid: false, message: "Job has no openings defined" };
  }

  if (!applications || applications.length === 0) {
    return { isValid: false, message: "No applications found for this job" };
  }

  const eligibleCount = applications.filter(
    app => (app.eligibility?.atsScore || 0) >= 70
  ).length;

  if (eligibleCount === 0) {
    return { isValid: false, message: "No candidates meet ATS score requirement" };
  }

  return { isValid: true, message: "Shortlisting can proceed" };
}
