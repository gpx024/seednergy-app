export type GrowingEnvironment = "indoor" | "balcony" | "outdoor";
export type LightCondition = "low" | "medium" | "bright";
export type TimeAvailability = "minimal" | "moderate" | "flexible";
export type Motivation = "food" | "nature" | "calm" | "sustainability";

export interface OnboardingAnswers {
  environment: GrowingEnvironment;
  lightCondition: LightCondition;
  timeAvailability: TimeAvailability;
  motivation: Motivation;
}

export const defaultOnboardingAnswers: OnboardingAnswers = {
  environment: "indoor",
  lightCondition: "bright",
  timeAvailability: "moderate",
  motivation: "food"
};

export function explainCressRecommendation(answers: OnboardingAnswers): string {
  const space = answers.environment === "indoor" ? "your indoor space" : answers.environment === "balcony" ? "your balcony" : "your outdoor space";
  const routine = answers.timeAvailability === "minimal" ? "a light check-in routine" : answers.timeAvailability === "flexible" ? "the time you enjoy spending with plants" : "regular short check-ins";
  return `Cress suits ${space}, ${routine}, and gives clear progress for your first harvest.`;
}
