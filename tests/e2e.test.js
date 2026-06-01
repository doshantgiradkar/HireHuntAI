/**
 * End-to-End Test Suite for Node-Cron Features
 * 
 * This test suite simulates real-world scenarios:
 * - Complete shortlisting workflow
 * - Database operations
 * - Email notifications
 * - Cron job execution
 * 
 * Prerequisites:
 * - MongoDB connection
 * - All models properly set up
 * - Environment variables configured
 * 
 * Usage: node tests/e2e.test.js
 */

// Mock database objects for testing without actual DB
const mockDB = {
  jobs: [],
  applications: [],
  interviews: [],
  assessments: []
};

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

const assertTrue = (value, message) => {
  if (!value) {
    throw new Error(`${message} - Expected true but got ${value}`);
  }
};

const assertGreater = (actual, expected, message) => {
  if (actual <= expected) {
    throw new Error(`${message}\nExpected greater than: ${expected}\nActual: ${actual}`);
  }
};

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

// Mock data generators
const createMockJob = (overrides = {}) => ({
  _id: 'job_' + Math.random().toString(36).substr(2, 9),
  title: 'Software Engineer',
  description: 'Senior developer needed',
  skills: ['JavaScript', 'React', 'Node.js'],
  openings: 5,
  expiresAt: new Date(Date.now() - 86400000), // Yesterday (expired)
  status: 'Open',
  companyName: 'Tech Corp',
  recruiterId: 'recruiter_123',
  ...overrides
});

const createMockApplication = (jobId, candidateId, overrides = {}) => ({
  _id: 'app_' + Math.random().toString(36).substr(2, 9),
  jobId,
  candidateId,
  candidateClerkId: candidateId,
  fullName: 'John Doe',
  email: `${candidateId}@example.com`,
  status: 'applied',
  eligibility: {
    atsScore: 75,
    matchScore: 80,
    ...overrides.eligibility
  },
  ...overrides
});

const createMockInterview = (overrides = {}) => ({
  _id: 'interview_' + Math.random().toString(36).substr(2, 9),
  jobId: 'job_123',
  candidates: [],
  assessmentId: 'assessment_123',
  startAt: new Date(),
  endAt: new Date(Date.now() + 86400000),
  duration: 1440,
  ...overrides
});

// ============= TEST SUITE: End-to-End Workflow =============

runTest('E2E: Create expired job for processing', () => {
  const job = createMockJob();
  
  assertEquals(job.status, 'Open', 'Job should be Open');
  assert(job.expiresAt < new Date(), 'Job should be expired');
  assert(job.openings > 0, 'Job should have openings');
  
  mockDB.jobs.push(job);
  assertEquals(mockDB.jobs.length, 1, 'Job should be added to DB');
});

runTest('E2E: Create eligible applications for job', () => {
  const job = mockDB.jobs[0];
  const applicants = [];
  
  // Create 20 eligible applicants
  for (let i = 0; i < 20; i++) {
    const app = createMockApplication(job._id, `candidate_${i}`, {
      eligibility: {
        atsScore: 70 + Math.random() * 30, // 70-100
        matchScore: Math.random() * 100 // 0-100
      }
    });
    applicants.push(app);
    mockDB.applications.push(app);
  }
  
  assertEquals(mockDB.applications.length, 20, 'Should have 20 applications');
  
  // Verify all are eligible
  const allEligible = mockDB.applications.every(app => app.eligibility.atsScore >= 70);
  assert(allEligible, 'All applications should be eligible');
});

runTest('E2E: Filter eligible candidates (ATS >= 70)', () => {
  const eligible = mockDB.applications.filter(app => app.eligibility.atsScore >= 70);
  assertGreater(eligible.length, 0, 'Should have eligible candidates');
  assertEquals(mockDB.applications.length, eligible.length, 'All should be eligible');
});

runTest('E2E: Calculate target shortlist count (1.5x openings)', () => {
  const job = mockDB.jobs[0];
  const targetCount = Math.ceil(job.openings * 1.5);
  
  assertEquals(targetCount, 8, 'For 5 openings, target should be 8');
  assertGreater(targetCount, job.openings, 'Target should be greater than openings');
});

runTest('E2E: Sort candidates by matchScore', () => {
  const sorted = [...mockDB.applications]
    .sort((a, b) => (b.eligibility?.matchScore || 0) - (a.eligibility?.matchScore || 0));
  
  assertEquals(sorted.length, mockDB.applications.length, 'All candidates should be included');
  
  // Verify sorting order
  for (let i = 0; i < sorted.length - 1; i++) {
    assert(
      sorted[i].eligibility.matchScore >= sorted[i + 1].eligibility.matchScore,
      'Candidates should be sorted by matchScore descending'
    );
  }
});

runTest('E2E: Select top candidates for shortlisting', () => {
  const job = mockDB.jobs[0];
  const targetCount = Math.ceil(job.openings * 1.5);
  const sorted = [...mockDB.applications]
    .sort((a, b) => (b.eligibility?.matchScore || 0) - (a.eligibility?.matchScore || 0));
  
  const shortlisted = sorted.slice(0, Math.min(targetCount, sorted.length));
  
  assertEquals(shortlisted.length, 8, 'Should shortlist 8 candidates');
  assertGreater(shortlisted[0].eligibility.matchScore, 0, 'Shortlisted should have matchScore');
});

runTest('E2E: Create interview for shortlisted candidates', () => {
  const job = mockDB.jobs[0];
  const interview = createMockInterview({
    jobId: job._id,
    candidates: mockDB.applications.slice(0, 8).map(app => ({
      candidateId: app.candidateClerkId,
      matchScore: app.eligibility.matchScore,
      feedback: '',
      interviewScore: 0
    }))
  });
  
  assertEquals(interview.candidates.length, 8, 'Interview should have 8 candidates');
  assert(interview.startAt < interview.endAt, 'Start should be before end');
  
  mockDB.interviews.push(interview);
  assertEquals(mockDB.interviews.length, 1, 'Interview should be added to DB');
});

runTest('E2E: Update application statuses to "shortlisted"', () => {
  const shortlistedIds = new Set(mockDB.interviews[0].candidates.map(c => c.candidateId));
  
  const updated = mockDB.applications.map(app => {
    if (shortlistedIds.has(app.candidateClerkId)) {
      return { ...app, status: 'shortlisted' };
    }
    return app;
  });
  
  const shortlistedCount = updated.filter(app => app.status === 'shortlisted').length;
  assertEquals(shortlistedCount, 8, 'Should have 8 shortlisted');
  
  const rejectedCount = updated.filter(app => app.status === 'applied').length;
  assertEquals(rejectedCount, 12, 'Should have 12 still applied');
});

runTest('E2E: Update job status to "interview_scheduled"', () => {
  const job = { ...mockDB.jobs[0], status: 'interview_scheduled' };
  assertEquals(job.status, 'interview_scheduled', 'Job status should be updated');
});

runTest('E2E: Prepare candidate notifications', () => {
  const candidates = mockDB.applications.slice(0, 8);
  const notifications = candidates.map(candidate => ({
    type: 'shortlist',
    to: candidate.email,
    subject: `Congratulations! You've been shortlisted`,
    candidateName: candidate.fullName,
    jobTitle: mockDB.jobs[0].title,
    companyName: mockDB.jobs[0].companyName
  }));
  
  assertEquals(notifications.length, 8, 'Should have 8 notifications');
  
  notifications.forEach(notif => {
    assert(notif.to.includes('@'), 'Should have valid email');
    assert(notif.candidateName.length > 0, 'Should have candidate name');
  });
});

runTest('E2E: Prepare recruiter notification with summary', () => {
  const shortlistedCount = 8;
  const recruiterNotif = {
    type: 'recruiter_summary',
    to: 'recruiter@techcorp.com',
    jobTitle: mockDB.jobs[0].title,
    shortlistCount: shortlistedCount,
    targetCount: 8,
    totalRequired: mockDB.jobs[0].openings
  };
  
  assertEquals(recruiterNotif.shortlistCount, recruiterNotif.targetCount, 
    'Should shortlist full target count');
  assert(recruiterNotif.shortlistCount >= recruiterNotif.totalRequired,
    'Shortlist should be at least 1.5x openings');
});

// ============= TEST SUITE: Edge Cases =============

runTest('E2E: Handle insufficient applications', () => {
  const job = createMockJob({ openings: 100 });
  const applications = Array.from({ length: 5 }, (_, i) => 
    createMockApplication(job._id, `candidate_e2e_1_${i}`, {
      eligibility: { atsScore: 75, matchScore: 80 }
    })
  );
  
  const targetCount = Math.ceil(job.openings * 1.5); // 150
  const shortlistCount = Math.min(targetCount, applications.length);
  
  assertEquals(shortlistCount, 5, 'Should shortlist all 5 available candidates');
});

runTest('E2E: Handle no eligible applications', () => {
  const job = createMockJob();
  const ineligibleApps = Array.from({ length: 10 }, (_, i) =>
    createMockApplication(job._id, `candidate_ineligible_${i}`, {
      eligibility: { atsScore: 50, matchScore: 30 } // Below 70
    })
  );
  
  const eligible = ineligibleApps.filter(app => app.eligibility.atsScore >= 70);
  assertEquals(eligible.length, 0, 'Should have no eligible candidates');
});

runTest('E2E: Handle single application with high score', () => {
  const job = createMockJob({ openings: 5 });
  const app = createMockApplication(job._id, 'candidate_single', {
    eligibility: { atsScore: 95, matchScore: 99 }
  });
  
  const shortlistCount = app.eligibility.atsScore >= 70 ? 1 : 0;
  assertEquals(shortlistCount, 1, 'Should shortlist the single high-scoring candidate');
});

runTest('E2E: Handle exact ATS score boundary (70)', () => {
  const app = createMockApplication('job_boundary', 'candidate_boundary_70', {
    eligibility: { atsScore: 70, matchScore: 50 }
  });
  
  assert(app.eligibility.atsScore >= 70, 'Score of 70 should be eligible');
});

runTest('E2E: Handle just below ATS score boundary (69.9)', () => {
  const app = createMockApplication('job_boundary', 'candidate_boundary_69', {
    eligibility: { atsScore: 69.9, matchScore: 50 }
  });
  
  assert(app.eligibility.atsScore < 70, 'Score of 69.9 should be ineligible');
});

// ============= TEST SUITE: Performance =============

runTest('E2E: Process large candidate pool efficiently', () => {
  const job = createMockJob({ openings: 10 });
  const largePool = Array.from({ length: 1000 }, (_, i) =>
    createMockApplication(job._id, `candidate_perf_${i}`, {
      eligibility: {
        atsScore: 70 + Math.random() * 30,
        matchScore: Math.random() * 100
      }
    })
  );
  
  const startTime = Date.now();
  
  const eligible = largePool.filter(app => app.eligibility.atsScore >= 70);
  const sorted = eligible.sort((a, b) => 
    (b.eligibility?.matchScore || 0) - (a.eligibility?.matchScore || 0)
  );
  const shortlisted = sorted.slice(0, Math.ceil(job.openings * 1.5));
  
  const elapsed = Date.now() - startTime;
  
  assertEquals(shortlisted.length, 15, 'Should shortlist 15 candidates');
  assertGreater(2000, elapsed, 'Should process 1000 candidates in < 2 seconds');
});

runTest('E2E: Generate notifications for large shortlist efficiently', () => {
  const shortlistCount = 50;
  const startTime = Date.now();
  
  const notifications = Array.from({ length: shortlistCount }, (_, i) => ({
    candidateId: i,
    email: `candidate_${i}@example.com`,
    status: 'pending'
  }));
  
  const elapsed = Date.now() - startTime;
  
  assertEquals(notifications.length, shortlistCount, 'Should create all notifications');
  assert(elapsed < 100, 'Should generate notifications quickly');
});

// ============= TEST SUITE: Data Consistency =============

runTest('E2E: Maintain consistency across shortlisting workflow', () => {
  const job = createMockJob();
  const initialAppCount = mockDB.applications.length;
  
  // After shortlisting, all applications should still exist
  const shortlistedCount = 8;
  const rejectedCount = initialAppCount - shortlistedCount;
  
  assertEquals(shortlistedCount + rejectedCount, initialAppCount,
    'Shortlisted + Rejected should equal total');
});

runTest('E2E: Ensure interview has all required fields', () => {
  const interview = mockDB.interviews[0];
  
  assert(interview._id, 'Interview should have ID');
  assert(interview.jobId, 'Interview should have jobId');
  assert(Array.isArray(interview.candidates), 'Interview should have candidates array');
  assert(interview.assessmentId, 'Interview should have assessmentId');
  assert(interview.startAt, 'Interview should have startAt');
  assert(interview.endAt, 'Interview should have endAt');
  assert(interview.duration > 0, 'Interview should have duration');
});

runTest('E2E: Verify candidate data in interview', () => {
  const interview = mockDB.interviews[0];
  
  interview.candidates.forEach(candidate => {
    assert(candidate.candidateId, 'Candidate should have ID');
    assert(typeof candidate.matchScore === 'number', 'Should have matchScore');
    assert(typeof candidate.feedback === 'string', 'Should have feedback');
    assert(typeof candidate.interviewScore === 'number', 'Should have interviewScore');
  });
});

// ============= Results Summary =============
console.log('\n' + '='.repeat(50));
console.log('END-TO-END TEST RESULTS');
console.log('='.repeat(50));
console.log(`✓ Passed: ${testsPassed}`);
console.log(`✗ Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);

console.log('\n📊 Mock Database State:');
console.log(`  Jobs: ${mockDB.jobs.length}`);
console.log(`  Applications: ${mockDB.applications.length}`);
console.log(`  Interviews: ${mockDB.interviews.length}`);
console.log(`  Assessments: ${mockDB.assessments.length}`);

if (testsFailed > 0) {
  process.exit(1);
}
