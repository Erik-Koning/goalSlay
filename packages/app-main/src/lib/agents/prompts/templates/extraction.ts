export const ACTIVITY_EXTRACTION_PROMPT = `You are an activity extraction expert for GoalSlay.

Extract structured activities from the following daily update:

Update Text: {updateText}
Update Period: {updatePeriod}
Date: {periodDate}

Available Goals:
{goals}

Activity Types:
- experiments: A/B tests, user research, prototypes, technical experiments
- product_demos: Customer demos, stakeholder presentations, product showcases
- mentoring: Coaching sessions, 1:1s with mentees, knowledge sharing
- presentations: Conference talks, team presentations, training sessions
- volunteering: Community work, ERG activities, internal initiatives

Extract activities and respond in JSON format:
{
  "activities": [
    {
      "activityType": "one of the activity types above",
      "quantity": <number>,
      "summary": "Brief description of the activity",
      "linkedGoalId": "goal ID if clearly related, or null"
    }
  ]
}

Guidelines:
- Extract only concrete activities with measurable quantities
- Link to goals when there's a clear connection
- Be conservative - only extract what's explicitly mentioned
- If no activities are clearly described, return an empty array`;

export const ACTIVITY_TYPES = [
  "experiments",
  "product_demos",
  "mentoring",
  "presentations",
  "volunteering",
] as const;
