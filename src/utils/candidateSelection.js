
/**
 * Calculates the raw combined score for a candidate based on interview and match scores.
 * 
 * @param {Object} candidate - The candidate object.
 * @param {number} candidate.interviewScore - The score from the interview (0-100).
 * @param {number} candidate.matchScore - The matching score (0-100).
 * @returns {number} The raw combined score.
 */
export const calculateRawCombinedScore = (candidate) => {
  const interviewScore = candidate.interviewScore || 0;
  const matchScore = candidate.matchScore || 0;
  return (interviewScore + matchScore) / 2;
};

/**
 * Calculates the percentile rank of a score within a dataset.
 * Formula: P = ((Count of scores < candidateScore) + (0.5 * Count of scores = candidateScore)) / Total Count * 100
 * 
 * @param {number} candidateScore - The score to calculate the percentile for.
 * @param {number[]} allScores - An array of all scores in the dataset.
 * @returns {number} The percentile rank (0-100).
 */
export const calculatePercentileRank = (candidateScore, allScores) => {
  if (!allScores || allScores.length === 0) {
    return 0;
  }

  const countLess = allScores.filter(score => score < candidateScore).length;
  const countEqual = allScores.filter(score => score === candidateScore).length;
  const totalCount = allScores.length;

  const percentile = ((countLess + (0.5 * countEqual)) / totalCount) * 100;
  return percentile;
};

/**
 * Generates a leaderboard of candidates, calculating combined scores and percentiles.
 * 
 * @param {Object[]} candidates - Array of candidate objects.
 * @param {string} [sortBy='combinedPercentile'] - Sorting criterion ('combinedPercentile' or 'matchScore').
 * @returns {Object[]} Sorted array of candidates with attached 'combinedPercentile' and 'rawCombinedScore'.
 */
export const generateLeaderboard = (candidates, sortBy = 'combinedPercentile') => {
  if (!candidates || candidates.length === 0) {
    return [];
  }

  // Step 1: Calculate Raw Combined Scores for all candidates
  const candidatesWithScores = candidates.map(candidate => {
    const rawScore = calculateRawCombinedScore(candidate);
    return {
      ...candidate,
      _rawCombinedScore: rawScore // stored for percentile calc, prefixed with _ to indicate internal use if needed, but useful for debugging
    };
  });

  const allRawScores = candidatesWithScores.map(c => c._rawCombinedScore);

  // Step 2: Calculate Percentile Ranks
  const candidatesWithPercentiles = candidatesWithScores.map(candidate => {
    const percentile = calculatePercentileRank(candidate._rawCombinedScore, allRawScores);
    return {
      ...candidate,
      combinedPercentile: parseFloat(percentile.toFixed(2)) // Round to 2 decimal places for cleaner output
    };
  });

  // Step 3: Sort Candidates
  return candidatesWithPercentiles.sort((a, b) => {
    if (sortBy === 'matchScore') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    } else {
      // Default to combinedPercentile
      return b.combinedPercentile - a.combinedPercentile;
    }
  });
};

/**
 * Selects the top N candidates from a pre-sorted list.
 * 
 * @param {Object[]} sortedCandidates - Array of already sorted candidates.
 * @param {number} numJobPosts - The number of top candidates to select.
 * @returns {Object[]} The top N candidates.
 */
export const selectTopNCandidates = (sortedCandidates, numJobPosts) => {
  if (!sortedCandidates) return [];
  if (numJobPosts <= 0) return [];
  
  return sortedCandidates.slice(0, numJobPosts);
};
