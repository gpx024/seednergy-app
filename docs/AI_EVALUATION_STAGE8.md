# Stage 8 AI evaluation record

## Completed checks

- The photo-check Edge Function keeps the OpenAI key server-side and requests structured output.
- Requests are authenticated, cycle ownership is verified, quota is checked server-side, and result persistence is server-owned.
- AI output cannot directly mutate cycle state.
- Provider timeout, malformed output, unsafe uncertainty, and quota paths have explicit error handling or safe fallback behaviour.
- Automated Stage 8 contract tests passed as part of the full test suite at handover.
- The owner tested live AI photo checks on the Android development build and confirmed the workflow worked on the Pixel device.

## Evaluation fixtures

`scripts/run-stage8-eval.mjs` supports the labelled cases `AI-001` through `AI-006`. It creates an isolated confirmed user, uploads the supplied private test image, invokes the live function, prints the structured result and request log, then removes its records and storage objects.

The evaluation script requires `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_PUBLISHABLE_KEY` only in the process environment. These values must not be written to repository files.

## Remaining production evidence

- Expand the labelled set with real photos covering healthy progress, low light, overwatering, poor focus, obstruction, non-plant images, and harvest readiness for every launch seed.
- Have a horticultural reviewer label expected outcomes before measuring agreement.
- Record false reassurance, false alarm, unclear-photo, latency, quota, and fallback rates.
- Repeat the evaluation whenever the prompt, model, image preprocessing, or authored seed guidance changes.

The evaluation record intentionally does not claim medical, food-safety, or horticultural certainty.
