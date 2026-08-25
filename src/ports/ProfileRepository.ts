import type { OnboardingAnswers } from "@/src/application/onboarding/recommendation";

export interface GrowerProfile {
  id: string;
  email: string;
  displayName: string | null;
  environment: string | null;
  lightCondition: string | null;
  timeAvailability: string | null;
  motivation: string | null;
  onboardingCompletedAt: string | null;
}

export interface CompleteOnboardingInput extends OnboardingAnswers {
  displayName: string | null;
  timezone: string;
  notificationsEnabled: boolean;
}

export interface ProfileRepository {
  getMine(): Promise<GrowerProfile | null>;
  completeOnboarding(input: CompleteOnboardingInput): Promise<GrowerProfile>;
}
