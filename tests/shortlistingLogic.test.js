/**
 * Unit Tests for Shortlisting Logic
 * 
 * Tests cover:
 * - Candidate filtering (ATS score >= 70)
 * - Target count calculation (1.5x openings)
 * - Sorting by matchScore
 * - Edge cases (no applications, no eligible candidates, etc.)
 */

import {
  calculateTargetCount,
  shortlistCandidates,
  transformToInterviewFormat,
  validateShortlistingPossible
} from '../src/lib/shortlistingLogic.js';

// Test utilities
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const assertEquals = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
};

const assertArrayEquals = (actual, expected, message) => {
  if (actual.length !== expected.length) {
    throw new Error(`${message}\nExpected length: ${expected.length}\nActual length: ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`${message}\nMismatch at index ${i}`);
    }
  }
};

// Mock data generators
const createMockApplication = (id, atsScore = 75, matchScore = 80) => ({
  _id: `app_${id}`,
  candidateClerkId: `clerk_${id}`,
  candidateId: `candidate_${id}`,
  fullName: `Candidate ${id}`,
  email: `candidate${id}@example.com`,
  eligibility: {
    atsScore,
    matchScore
  }
});

const createMockJob = (openings = 5) => ({
  _id: 'job_123',
  title: 'Software Engineer',
  description: 'Senior developer needed',
  openings,
  expiresAt: new Date(Date.now() - 1000)
});

// Test Suites
let testsPassed = 0;
let testsFailed = 0;

function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`✓ ${testName}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${testName}`);
    console.error(`  ${error.message}`);
    testsFailed++;
  }
}

// ============= TEST SUITE: calculateTargetCount =============

runTest('calculateTargetCount: returns ceiling of 1.5x openings', () => {
  assertEquals(calculateTargetCount(5), 8, 'For 5 openings, should return 8 (ceil(5*1.5))');
  assertEquals(calculateTargetCount(10), 15, 'For 10 openings, should return 15 (ceil(10*1.5))');
  assertEquals(calculateTargetCount(3), 5, 'For 3 openings, should return 5 (ceil(3*1.5))');
  assertEquals(calculateTargetCount(1), 2, 'For 1 opening, should return 2 (ceil(1*1.5))');
});

runTest('calculateTargetCount: handles edge cases', () => {
  assertEquals(calculateTargetCount(0), 0, 'For 0 openings, should return 0');
  assertEquals(calculateTargetCount(100), 150, 'For 100 openings, should return 150');
});

// ============= TEST SUITE: shortlistCandidates =============

runTest('shortlistCandidates: returns empty when no applications', () => {
  const result = shortlistCandidates({
    openings: 5,
    applications: []
  });
  
  assertEquals(result.shortlistCount, 0, 'Should have 0 shortlisted');
  assertEquals(result.rejectedCandidates.length, 0, 'Should have 0 rejected');
  assertEquals(result.totalEligible, 0, 'Should have 0 eligible');
  assert(result.reason.includes('No applications'), 'Should include reason');
});

runTest('shortlistCandidates: filters candidates by ATS score >= 70', () => {
  const applications = [
    createMockApplication(1, 75, 80), // Eligible
    createMockApplication(2, 65, 85), // Not eligible (ATS < 70)
    createMockApplication(3, 70, 90), // Eligible (ATS = 70, boundary)
    createMockApplication(4, 69, 88)  // Not eligible (ATS < 70)
  ];

  const result = shortlistCandidates({
    openings: 5,
    applications
  });

  assertEquals(result.totalEligible, 2, 'Should have 2 eligible candidates');
  assertEquals(result.shortlistCount, 2, 'Should shortlist 2 candidates');
  assertEquals(result.rejectedCandidates.length, 2, 'Should reject 2 candidates');
});

runTest('shortlistCandidates: sorts by matchScore descending', () => {
  const applications = [
    createMockApplication(1, 75, 70),
    createMockApplication(2, 75, 90),
    createMockApplication(3, 75, 85),
    createMockApplication(4, 75, 60)
  ];

  const result = shortlistCandidates({
    openings: 10,
    applications
  });

  // All 4 should be shortlisted (eligible and < 1.5x10=15)
  assertEquals(result.shortlistCount, 4, 'Should shortlist all 4 candidates');
  
  // Check sorting order
  assertEquals(result.shortlistedCandidates[0].eligibility.matchScore, 90, 'First should have highest matchScore');
  assertEquals(result.shortlistedCandidates[1].eligibility.matchScore, 85, 'Second should have second highest');
  assertEquals(result.shortlistedCandidates[2].eligibility.matchScore, 70, 'Third should be third highest');
  assertEquals(result.shortlistedCandidates[3].eligibility.matchScore, 60, 'Fourth should be lowest');
});

runTest('shortlistCandidates: applies 1.5x multiplier correctly', () => {
  // Create 20 eligible candidates with different matchScores
  const applications = Array.from({ length: 20 }, (_, i) =>
    createMockApplication(i, 75, 100 - i) // Scores from 100 down to 81
  );

  const result = shortlistCandidates({
    openings: 5, // Target: ceil(5 * 1.5) = 8
    applications
  });

  assertEquals(result.shortlistCount, 8, 'Should shortlist 8 candidates (1.5x of 5)');
  assertEquals(result.rejectedCandidates.length, 12, 'Should reject 12 candidates');
});

runTest('shortlistCandidates: selects all when eligible < target', () => {
  const applications = [
    createMockApplication(1, 75, 80),
    createMockApplication(2, 75, 85),
    createMockApplication(3, 75, 90)
  ];

  const result = shortlistCandidates({
    openings: 10, // Target: ceil(10 * 1.5) = 15, but only 3 eligible
    applications
  });

  assertEquals(result.shortlistCount, 3, 'Should shortlist all 3 eligible candidates');
  assertEquals(result.rejectedCandidates.length, 0, 'Should have 0 rejected');
});

runTest('shortlistCandidates: rejects all when no eligible candidates', () => {
  const applications = [
    createMockApplication(1, 65, 80),
    createMockApplication(2, 60, 85),
    createMockApplication(3, 50, 90)
  ];

  const result = shortlistCandidates({
    openings: 5,
    applications
  });

  assertEquals(result.shortlistCount, 0, 'Should shortlist 0 candidates');
  assertEquals(result.rejectedCandidates.length, 3, 'Should reject all 3');
  assertEquals(result.totalEligible, 0, 'Should have 0 eligible');
});

runTest('shortlistCandidates: returns correct reason messages', () => {
  const resultEmpty = shortlistCandidates({
    openings: 5,
    applications: []
  });
  assert(resultEmpty.reason.includes('No applications'), 'Should mention no applications');

  const resultNoEligible = shortlistCandidates({
    openings: 5,
    applications: [createMockApplication(1, 60, 80)]
  });
  assert(resultNoEligible.reason.includes('ATS score requirement'), 'Should mention ATS requirement');

  const resultSuccess = shortlistCandidates({
    openings: 5,
    applications: [createMockApplication(1, 75, 80)]
  });
  assert(resultSuccess.reason.includes('successfully'), 'Should mention success');
});

// ============= TEST SUITE: transformToInterviewFormat =============

runTest('transformToInterviewFormat: transforms candidates correctly', () => {
  const candidates = [
    createMockApplication(1, 75, 85),
    createMockApplication(2, 75, 90)
  ];

  const result = transformToInterviewFormat(candidates);

  assertEquals(result.length, 2, 'Should have 2 candidates');
  assertEquals(result[0].candidateId, 'clerk_1', 'Should use candidateClerkId');
  assertEquals(result[0].matchScore, 85, 'Should include matchScore');
  assertEquals(result[0].feedback, '', 'Feedback should be empty string');
  assertEquals(result[0].interviewScore, 0, 'Interview score should be 0');
});

runTest('transformToInterviewFormat: handles missing eligibility data', () => {
  const candidates = [{
    candidateClerkId: 'clerk_1',
    // Missing eligibility
  }];

  const result = transformToInterviewFormat(candidates);

  assertEquals(result[0].matchScore, 0, 'Should default matchScore to 0');
});

// ============= TEST SUITE: validateShortlistingPossible =============

runTest('validateShortlistingPossible: validates successfully', () => {
  const job = createMockJob(5);
  const applications = [createMockApplication(1, 75, 80)];

  const result = validateShortlistingPossible(job, applications);

  assert(result.isValid, 'Should be valid');
  assert(result.message.includes('can proceed'), 'Should mention can proceed');
});

runTest('validateShortlistingPossible: rejects when job not found', () => {
  const applications = [createMockApplication(1, 75, 80)];

  const result = validateShortlistingPossible(null, applications);

  assert(!result.isValid, 'Should be invalid');
  assert(result.message.includes('Job not found'), 'Should mention job not found');
});

runTest('validateShortlistingPossible: rejects when no openings', () => {
  const job = createMockJob(0);
  const applications = [createMockApplication(1, 75, 80)];

  const result = validateShortlistingPossible(job, applications);

  assert(!result.isValid, 'Should be invalid');
  assert(result.message.includes('openings'), 'Should mention openings');
});

runTest('validateShortlistingPossible: rejects when no applications', () => {
  const job = createMockJob(5);

  const result = validateShortlistingPossible(job, []);

  assert(!result.isValid, 'Should be invalid');
  assert(result.message.includes('No applications'), 'Should mention no applications');
});

runTest('validateShortlistingPossible: rejects when no eligible candidates', () => {
  const job = createMockJob(5);
  const applications = [
    createMockApplication(1, 60, 80),
    createMockApplication(2, 65, 85)
  ];

  const result = validateShortlistingPossible(job, applications);

  assert(!result.isValid, 'Should be invalid');
  assert(result.message.includes('ATS score'), 'Should mention ATS score');
});

// ============= Results Summary =============
console.log('\n' + '='.repeat(50));
console.log('SHORTLISTING LOGIC TEST RESULTS');
console.log('='.repeat(50));
console.log(`✓ Passed: ${testsPassed}`);
console.log(`✗ Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
}
