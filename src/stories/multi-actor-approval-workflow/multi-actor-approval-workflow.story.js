/**
 * Multi-Actor Approval Workflow Story Definition
 *
 * This file defines a business process that involves multiple user roles
 * collaborating in a workflow with approvals.
 */

export const MultiActorApprovalWorkflowStory = {
  title: 'Multi-Actor Approval Workflow',
  steps: [
    'Login as an applicant',
    'Initiate a change request',
    'Logout and login as a program officer',
    'Review and approve the change request',
    'Verify changes are reflected across the system'
  ]
}