import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { defaultOnboardingAnswers, type OnboardingAnswers } from "@/src/application/onboarding/recommendation";

const storageKey = "seednergy.onboarding.answers.v1";

interface OnboardingContextValue {
  answers: OnboardingAnswers;
  loading: boolean;
  setAnswer<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]): void;
  clear(): Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [answers, setAnswers] = useState(defaultOnboardingAnswers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored) setAnswers({ ...defaultOnboardingAnswers, ...JSON.parse(stored) as Partial<OnboardingAnswers> });
    }).finally(() => setLoading(false));
  }, []);

  const setAnswer = useCallback(<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setAnswers((current) => {
      const next = { ...current, [key]: value };
      void AsyncStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<OnboardingContextValue>(() => ({
    answers,
    loading,
    setAnswer,
    async clear() {
      setAnswers(defaultOnboardingAnswers);
      await AsyncStorage.removeItem(storageKey);
    }
  }), [answers, loading, setAnswer]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used inside OnboardingProvider.");
  return value;
}
