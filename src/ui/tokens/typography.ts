const headingTracking = -0.2;

export const typography = {
  displayLarge: { fontFamily: "CrimsonText_600SemiBold", fontSize: 38, lineHeight: 53.2, letterSpacing: headingTracking },
  display: { fontFamily: "CrimsonText_600SemiBold", fontSize: 30, lineHeight: 42, letterSpacing: headingTracking },
  displayMedium: { fontFamily: "CrimsonText_600SemiBold", fontSize: 25, lineHeight: 35, letterSpacing: headingTracking },
  invertedTitle: { fontFamily: "CrimsonText_600SemiBold", fontSize: 38, lineHeight: 53.2, letterSpacing: headingTracking },
  name: { fontFamily: "CrimsonText_600SemiBold", fontSize: 22, lineHeight: 30.8, letterSpacing: headingTracking },
  rowName: { fontFamily: "CrimsonText_600SemiBold", fontSize: 18, lineHeight: 25.2, letterSpacing: headingTracking },
  title: { fontFamily: "CrimsonText_600SemiBold", fontSize: 20, lineHeight: 28, letterSpacing: headingTracking },
  cardTitle: { fontFamily: "CrimsonText_600SemiBold", fontSize: 22, lineHeight: 30.8, letterSpacing: headingTracking },
  panelHeadline: { fontFamily: "CrimsonText_600SemiBold", fontSize: 20, lineHeight: 28, letterSpacing: headingTracking },
  button: { fontFamily: "CrimsonText_700Bold", fontSize: 22, lineHeight: 30.8, letterSpacing: headingTracking },
  body: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  bodyStrong: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 16 },
  label: { fontFamily: "Inter_700Bold", fontSize: 11, lineHeight: 14, letterSpacing: 0.66 },
  tab: { fontFamily: "Inter_600SemiBold", fontSize: 10, lineHeight: 13, letterSpacing: 0.35 }
} as const;
