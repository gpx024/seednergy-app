# Stage 8 AI evaluation record

## Completed checks

- The photo-check Edge Function keeps the OpenAI key server-side and requests structured output.
- Requests are authenticated, cycle ownership is verified, quota is checked server-side, and result persistence is server-owned.
- AI output cannot directly mutate cycle state.
- Provider timeout, malformed output, unsafe uncertainty, and quota paths have explicit error handling or safe fallback behaviour.
- Automated Stage 8 contract tests passed as part of the full test suite at handover.
- The owner tested live AI photo checks on the Android development build and confirmed the workflow worked on the Pixel device.

## Evaluation harness

`scripts/run-stage8-eval.mjs` consumes a labelled JSON manifest. For every case it creates an isolated confirmed user and cycle for the selected seed, uploads the private test image, invokes the live function, reads the server-owned usage record, then removes the temporary Auth user, database rows and Storage object.

The generated JSON report contains:

- acceptable-status agreement;
- false-reassurance and false-alarm rates;
- unclear, rejection and provider-error rates;
- quota-consumption mismatches;
- total and mean cost;
- p50 and p95 latency;
- estimated monthly cost for the manifest's explicitly labelled usage scenarios;
- per-case model output and reviewer notes.

The harness supports Cress, Pea shoots, Radish microgreens and Broccoli microgreens through each case's `seedSlug`. It creates one temporary user per case so a large evaluation corpus does not collide with the normal per-user quota.

The evaluation script requires `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_PUBLISHABLE_KEY` only in the process environment. These values must not be written to repository files.

1. Copy `evaluation/stage8/manifest.example.json` to a private working manifest.
2. Put the licensed evaluation images beside that manifest and replace the illustrative cases with reviewer-labelled cases.
3. Set `reviewStatus` to `expert-reviewed` only after the expected outcomes have been approved by the horticultural reviewer.
4. Add production thresholds only after they are explicitly approved. An empty `thresholds` object cannot produce a passing production gate.
5. Run:

```powershell
npm run eval:stage8 -- --manifest C:\secure\seednergy-eval\manifest.json --output C:\secure\seednergy-eval\report.json
```

Evaluation photos and generated reports can contain sensitive or licensed material. Keep them outside Git unless a separately approved, anonymised corpus is intended to be versioned.

## Gate interpretation

- `insufficient_evidence`: the corpus is not marked `expert-reviewed`, regardless of apparent agreement.
- `not_configured`: expert review is recorded but approved production thresholds are absent.
- `failed`: at least one configured threshold failed. The command exits with status 2.
- `passed`: an expert-reviewed corpus met every configured threshold.

The example monthly scenarios are explicitly illustrative usage assumptions, not approved entitlements or forecasts. Final free, paid and subscriber allowances remain open until measured cost and product evidence are reviewed. Harvest-readiness protected use also remains a commercial policy decision.

## Remaining production evidence

- Assemble licensed photos covering healthy progress, low light, overwatering, poor focus, obstruction, non-plant images and harvest readiness for every launch seed and check type.
- Have a horticultural reviewer label the expected outcomes before measuring agreement.
- Approve production thresholds for agreement, false reassurance, provider error, latency and cost.
- Run the live manifest and retain the report as release evidence.
- Repeat the evaluation whenever the prompt, model, image preprocessing, or authored seed guidance changes.

The evaluation record intentionally does not claim medical, food-safety, or horticultural certainty.
