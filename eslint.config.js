const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: [".expo/**", "admin/**", "coverage/**", "design-system/**", "dist/**", "dist-stage8/**", "node_modules/**", "supabase/functions/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: ".",
          zones: [
            { target: "./app", from: ["./src/domain", "./src/infrastructure"] },
            { target: "./src/ui", from: ["./src/infrastructure"] },
            { target: "./src/application", from: ["./app", "./src/ui", "./src/infrastructure"] },
            { target: "./src/domain", from: ["./app", "./src/application", "./src/infrastructure", "./src/ui"] },
            { target: "./src/infrastructure", from: ["./app", "./src/application", "./src/ui"] }
          ]
        }
      ]
    }
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-native",
                "expo",
                "expo/**",
                "@supabase/**",
                "@react-native/**",
                "i18next",
                "react-i18next"
              ],
              message: "Domain code must remain independent of UI, Expo, and provider libraries."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**", "@/src/ui/**", "@/src/infrastructure/**"],
              message: "Application code may depend on domain contracts, not screens, UI, or adapters."
            }
          ]
        }
      ]
    }
  }
];
