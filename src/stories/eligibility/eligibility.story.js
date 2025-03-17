/**
 * Eligibility Screening Story Definition
 *
 * This file contains the business process steps for the eligibility screening workflow.
 * It defines the sequence of steps that users follow when determining applicant eligibility.
 *
 * HOW TO CREATE A STORY FILE:
 * You can generate a file like this using the CLI command:
 * npm run create-entity -- story EligibilityScreening
 */

export const EligibilityStory = {
  title: "Eligibility Screening Process",
  steps: [
    "Load applicant data",
    "Review transcripts",
    "Mark eligibility status"
  ]
}