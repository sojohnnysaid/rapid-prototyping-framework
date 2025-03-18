/**
 * Change Request Workflow Story Definition
 *
 * This file defines a business process that involves multiple user roles
 * collaborating in a workflow with approvals.
 */

export const ChangeRequestStory = {
  title: 'Change Request Workflow',
  steps: [
    'Load applicants',
    'Select an applicant',
    'Submit status change request',
    'User Journey Completed'
  ]
}

export const ChangeApprovalStory = {
  title: 'Change Approval Workflow',
  steps: [
    'Review incoming change requests',
    'Evaluate request details and impact',
    'Make approval decision with feedback'
  ]
}