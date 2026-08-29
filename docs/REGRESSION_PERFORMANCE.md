# Regression and performance verification

## Scope

This release-candidate gate covers the completed pre-commercial code without changing the pending visual design. It verifies the deterministic grow loop, photo-check boundary, private harvest-history contract, CMS build, automated application tests, Expo project health and Android production-export size.

It does not claim physical-device startup, rendering, memory, battery or network performance. Those measurements require the consolidated native APK on the target Pixel and remain part of physical acceptance.

## Commands

Run the complete local gate with:

```powershell
npm run verify:release
```

Run only the Android export budget with:

```powershell
npm run verify:performance
```

The performance command creates an isolated directory under the operating-system temporary folder, performs an Android production export, reports measured sizes, then deletes only that validated temporary directory.

## Current Android export baseline

Measured 29 August 2026 after changing font imports to include only the seven families and weights used by the interface:

| Metric | Baseline | Budget |
| --- | ---: | ---: |
| Hermes JavaScript bundle | 6,131,528 bytes | 6,750,000 bytes |
| Packaged assets | 13,083,247 bytes | 15,000,000 bytes |
| Largest single asset | 2,401,839 bytes | 2,650,000 bytes |
| Complete Expo export | 19,217,484 bytes | 22,000,000 bytes |

The previous broad font-family imports produced 18,259,951 asset bytes and a 24,407,425-byte export. Direct weight imports removed 17 unused font assets and reduced the export by 5,189,941 bytes, approximately 21.3 percent.

The five temporary seed images remain the largest assets. They must be reassessed when approved photography replaces them. Increasing a budget to make a failure disappear is not acceptance, the asset or dependency change should be reviewed first.

## Regression coverage

The release regression test exercises one coherent Cress journey through:

1. cycle creation and Day 1 presentation;
2. growth-stage context construction;
3. a deterministic photo-check result through the provider interface;
4. harvest-ready evaluation;
5. valid ready-to-harvest and harvested transitions;
6. a private harvest-history record without a photo, using fallback suggestions.

The full suite also retains the existing authentication, offline cache, database, CMS, notifications, AI, privacy, store-preparation, design-system and domain checks.

## Remaining physical acceptance

- Measure cold and warm startup on the Pixel.
- Check Home, Cycles, Explore and Garden scrolling with realistic records and images.
- Check memory behaviour around repeated camera and gallery use.
- Check offline launch, cached access and backend recovery.
- Check notification delivery, account deletion and Sentry in the consolidated APK.
