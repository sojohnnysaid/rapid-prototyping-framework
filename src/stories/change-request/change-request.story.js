/**
 * Change Request Workflow Story Definition
 *
 * This file defines a business process that involves multiple user roles
 * collaborating in a workflow with approvals.
 */

export const ChangeRequestStory = {
  title: 'Change Request Workflow',
  steps: [
    'Fill out change request form',
    'Submit change request for approval',
    'Wait for program officer review',
    'View approval status',
    'Implement approved changes'
  ]
}

export const ChangeApprovalStory = {
  title: 'Change Approval Workflow',
  steps: [
    'Review incoming change requests',
    'Evaluate request details and impact',
    'Make approval decision',
    'Provide feedback on the decision',
    'Confirm changes are implemented'
  ]
}