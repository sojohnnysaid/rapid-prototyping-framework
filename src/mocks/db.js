import { factory, primaryKey, oneOf, manyOf } from '@mswjs/data'

// Create the database with all models
export const db = factory({
  user: {
    id: primaryKey(Number),
    name: String,
    email: String,
    role: String  // e.g., admin, transcriptReviewer, applicantReviewer, programOfficer
  },
  applicant: {
    id: primaryKey(Number),
    name: String,
    email: String,
    transcriptReceived: Boolean,
    eligibilityStatus: String, // "Pending", "Eligible", "Ineligible"
    fieldOfStudy: String, // e.g., "Physics", "Computer Science", "Biology", etc.
    programOfficer: oneOf('programOfficer'),
    reviewer: oneOf('reviewer'),
    helpdeskTickets: manyOf('helpdeskTicket'),
  },
  programOfficer: {
    id: primaryKey(Number),
    name: String,
    applicants: manyOf('applicant'),
  },
  reviewer: {
    id: primaryKey(Number),
    name: String,
    email: String,
    expertise: String, // Primary field of expertise
    secondaryExpertise: String, // Secondary field of expertise
    maxAssignments: Number, // Maximum number of applications to assign
    currentAssignments: Number, // Current number of assigned applications
    assignedApplications: manyOf('applicant'),
  },
  helpdeskTicket: {
    id: primaryKey(Number),
    applicant: oneOf('applicant'),
    status: String, // "Open", "Resolved"
    question: String,
    response: String,
  },
  decisionLog: {
    id: primaryKey(Number),
    applicant: oneOf('applicant'),
    timestamp: String,
    decision: String,
    rationale: String,
  },
  // Add ReviewerMatching model directly to the main factory
  reviewerMatching: {
    id: primaryKey(Number),
    description: String,
    status: String // e.g., "Pending", "Approved", "Rejected"
  },
  // Change request model for multi-actor workflow
  changeRequest: {
    id: primaryKey(Number),
    title: String,
    description: String,
    status: String, // 'pending', 'approved', 'rejected'
    requestType: String, // 'eligibility', 'assignment', etc.
    requestedById: Number,
    requestedByName: String,
    requestedByRole: String,
    targetId: Number, // ID of the entity being changed
    targetType: String, // Type of entity being changed
    currentValue: String,
    requestedValue: String,
    dateRequested: String,
    dateReviewed: { nullable: true },
    reviewedById: { nullable: true },
    reviewedByName: { nullable: true },
    reviewNotes: { nullable: true }
  },
  // Notification model
  notification: {
    id: primaryKey(Number),
    description: String,
    status: String, // 'unread', 'read'
    type: String, // 'change-request', 'assignment', 'system'
    targetRole: String, // Role this notification is for
    relatedId: Number,
    date: String,
    link: String
  }
})

// Seed mock data
const officer1 = db.programOfficer.create({ id: 1, name: "Laura Maurizi" })

// Create reviewers with various expertise
const reviewer1 = db.reviewer.create({ 
  id: 101, 
  name: "Davis Jiang", 
  email: "davis.jiang@university.edu",
  expertise: "Physics", 
  secondaryExpertise: "Mathematics",
  maxAssignments: 5,
  currentAssignments: 1
})

const reviewer2 = db.reviewer.create({ 
  id: 102, 
  name: "Sarah Chen", 
  email: "schen@university.edu",
  expertise: "Computer Science", 
  secondaryExpertise: "Artificial Intelligence",
  maxAssignments: 4,
  currentAssignments: 0
})

const reviewer3 = db.reviewer.create({ 
  id: 103, 
  name: "Michael Rodriguez", 
  email: "mrodriguez@university.edu",
  expertise: "Biology", 
  secondaryExpertise: "Chemistry",
  maxAssignments: 6,
  currentAssignments: 2
})

const reviewer4 = db.reviewer.create({ 
  id: 104, 
  name: "Jennifer Washington", 
  email: "jwashington@university.edu",
  expertise: "Physics", 
  secondaryExpertise: "Astronomy",
  maxAssignments: 5,
  currentAssignments: 0
})

// Create applicants with different fields of study
const applicant1 = db.applicant.create({
  id: 1001,
  name: "Alice Johnson",
  email: "alice@example.com",
  transcriptReceived: true,
  eligibilityStatus: "Pending",
  fieldOfStudy: "Physics",
  programOfficer: officer1,
  reviewer: reviewer1,
})

const applicant2 = db.applicant.create({
  id: 1002,
  name: "Bob Smith",
  email: "bob@example.com",
  transcriptReceived: true,
  eligibilityStatus: "Pending",
  fieldOfStudy: "Computer Science",
  programOfficer: officer1
})

const applicant3 = db.applicant.create({
  id: 1003,
  name: "Carlos Rivera",
  email: "carlos@example.com",
  transcriptReceived: true,
  eligibilityStatus: "Pending",
  fieldOfStudy: "Biology",
  programOfficer: officer1
})

const applicant4 = db.applicant.create({
  id: 1004,
  name: "Diana Lee",
  email: "diana@example.com",
  transcriptReceived: true,
  eligibilityStatus: "Pending",
  fieldOfStudy: "Physics",
  programOfficer: officer1
})

db.helpdeskTicket.create({
  id: 1,
  applicant: applicant1,
  status: "Open",
  question: "Why is my status pending?",
  response: "We are reviewing your transcripts.",
})

db.decisionLog.create({
  id: 5001,
  applicant: applicant1,
  timestamp: new Date().toISOString(),
  decision: "Eligibility Review Pending",
  rationale: "Awaiting transcript verification",
})

// Seed sample data for ReviewerMatching
db.reviewerMatching.create({ 
  id: Date.now(), 
  description: "Sample ReviewerMatching rule", 
  status: "Pending" 
})

// Seed sample user data
db.user.create({ id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' });
db.user.create({ id: 2, name: 'Transcript Reviewer', email: 'reviewer@example.com', role: 'transcriptReviewer' });
db.user.create({ id: 3, name: 'Applicant Reviewer', email: 'appreview@example.com', role: 'applicantReviewer' });
db.user.create({ id: 4, name: 'Program Officer', email: 'officer@example.com', role: 'programOfficer' });

// Sample change requests for multi-actor workflow
db.changeRequest.create({
  id: 5001,
  title: "Eligibility Status Change",
  description: "Request to change eligibility status from Pending to Eligible based on transcript review completion",
  status: "pending",
  requestType: "eligibility",
  requestedById: 3,
  requestedByName: "Applicant Reviewer",
  requestedByRole: "applicantReviewer",
  targetId: 1001,
  targetType: "applicant",
  currentValue: "Pending",
  requestedValue: "Eligible",
  dateRequested: new Date().toISOString(),
  dateReviewed: null,
  reviewedById: null,
  reviewedByName: null,
  reviewNotes: null
});

// Sample notifications for multi-actor workflow
db.notification.create({
  id: 6001,
  description: "New eligibility change request for applicant #1001 awaiting your approval",
  status: "unread",
  type: "change-request",
  targetRole: "programOfficer",
  relatedId: 5001,
  date: new Date().toISOString(),
  link: "/change-approval"
});

db.notification.create({
  id: 6002,
  description: "Your eligibility change request for applicant #1001 has been submitted",
  status: "unread",
  type: "change-request",
  targetRole: "applicantReviewer",
  relatedId: 5001,
  date: new Date().toISOString(),
  link: "/change-request"
});

// Add sample approved notification for applicant reviewers
db.notification.create({
  id: 6003,
  description: "Your change request for applicant #1003 has been approved",
  status: "unread",
  type: "change-request",
  targetRole: "applicantReviewer",
  relatedId: 5002,
  date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  link: "/change-request"
});
