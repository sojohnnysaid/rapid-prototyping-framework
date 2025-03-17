/**
 * Reviewer Assignment Story Definition
 *
 * HOW TO CREATE A NEW BUSINESS PROCESS STORY:
 * This file was generated using the CLI command:
 * npm run create-entity -- story ReviewerAssignment
 *
 * The story object defines:
 * 1. Title: The name of the business process
 * 2. Steps: An ordered array of steps that users follow to complete the process
 *
 * USAGE NOTES:
 * - Each step should be short and clear
 * - The steps should match actions in the UI
 * - The step descriptions appear in the StoryGuide component
 * - Use the ProcessStepContext to highlight the current step as users progress
 *
 * To add a new business rule related to this process:
 * npm run create-entity -- businessrule ReviewerMatching
 */

export const ReviewerAssignmentStory = {
  title: 'Reviewer Assignment Process',
  steps: [
    'Load application and reviewer data',
    'Filter applications by field of study',
    'Select an applicant from the filtered list',
    'Choose a reviewer with matching expertise',
    'Confirm assignment and send notification'
  ]
}
