import type { OnboardingAnswers } from "@/src/application/onboarding/recommendation";
import type { NotificationPreferences } from "@/src/ports/NotificationService";

export type SpaceEnvironment = "indoor" | "balcony" | "outdoor";
export type SpaceLightCondition = "low" | "medium" | "bright";

export interface GrowerProfile {
  id: string;
  email: string;
  displayName: string | null;
  environment: string | null;
  lightCondition: string | null;
  timeAvailability: string | null;
  motivation: string | null;
  onboardingCompletedAt: string | null;
  aiPhotoNoticeAcceptedAt: string | null;
  avatarPath: string | null;
  notificationPreferences: NotificationPreferences;
}

export interface CompleteOnboardingInput extends OnboardingAnswers {
  displayName: string | null;
  timezone: string;
  notificationsEnabled: boolean;
}

export interface ProfileRepository {
  getMine(): Promise<GrowerProfile | null>;
  completeOnboarding(input: CompleteOnboardingInput): Promise<GrowerProfile>;
  acceptAiPhotoNotice(): Promise<GrowerProfile>;
  updateAvatarPath(path: string | null): Promise<GrowerProfile>;
  updateSpaceConditions(environment: SpaceEnvironment, lightCondition: SpaceLightCondition): Promise<GrowerProfile>;
}
