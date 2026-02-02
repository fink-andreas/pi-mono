# TODO: Raw LLM Traffic Logs Feature

## Step 1: Update Type Definitions
- [x] Add `onRequestLog` callback type to `packages/ai/src/types.ts`
- [x] Add `onResponseLog` callback type to `packages/ai/src/types.ts`
- [x] Define debug log interfaces (RequestLog, ResponseLog, ErrorLog)
- [x] Update `StreamOptions` to include new callbacks
- [x] Run `npm run check` to verify types

## Step 2: Create Debug Logger Utility
- [x] Create `packages/ai/src/debug-logger.ts`
- [x] Implement `createDebugLogger()` function that checks `PI_DEBUG_API`
- [x] Add logging functions for requests, responses, and errors
- [x] Support output modes: `pretty` (default), `json`, `compact`
- [x] Add timestamp and request ID tracking
- [x] Ensure logs go to stderr (not stdout)

## Step 3: Update Provider Implementations
- [x] Update `packages/ai/src/providers/google.ts`
  - [x] Add request logging before `generateContentStream`
  - [x] Add response logging for each stream chunk
  - [x] Add error logging
- [x] Update `packages/ai/src/providers/anthropic.ts`
  - [x] Add request logging before `messages.stream`
  - [x] Add response logging for each event
  - [x] Add error logging
- [x] Update `packages/ai/src/providers/openai-completions.ts`
  - [x] Add request logging before `chat.completions.create`
  - [x] Add response logging for each chunk
  - [x] Add error logging
- [x] Update `packages/ai/src/providers/openai-responses.ts`
  - [x] Add request logging
  - [x] Add response logging
  - [x] Add error logging
- [x] Update `packages/ai/src/providers/openai-codex-responses.ts`
  - [x] Add request logging
  - [x] Add response logging
  - [x] Add error logging
- [x] Update `packages/ai/src/providers/azure-openai-responses.ts`
  - [x] Add request logging
  - [x] Add response logging
  - [x] Add error logging
- [ ] Update `packages/ai/src/providers/google-gemini-cli.ts`
  - [ ] Add request logging
  - [ ] Add response logging
  - [ ] Add error logging
- [ ] Update `packages/ai/src/providers/google-vertex.ts`
  - [ ] Add request logging
  - [ ] Add response logging
  - [ ] Add error logging
- [ ] Update `packages/ai/src/providers/amazon-bedrock.ts`
  - [ ] Add request logging
  - [ ] Add response logging
  - [ ] Add error logging

## Step 4: Integrate Debug Logger with Stream Functions
- [ ] Update `packages/ai/src/stream.ts` to attach debug logger
- [ ] Check `PI_DEBUG_API` environment variable
- [ ] Attach `onRequestLog` and `onResponseLog` callbacks if enabled
- [ ] Ensure logger works with all API implementations

## Step 5: Update CLI
- [x] Add `debugApi?: boolean` to `packages/coding-agent/src/cli/args.ts` Args interface
- [x] Add `--debug-api` flag parsing
- [x] Update help text to include new flag
- [ ] Pass `debugApi` flag through to model/stream options
- [ ] Update relevant documentation strings

## Step 6: Update Documentation
- [ ] Update `packages/ai/README.md`
  - [ ] Add "Debugging Provider Payloads" section
  - [ ] Document `PI_DEBUG_API` environment variable
  - [ ] Add usage examples
  - [ ] Document log format
- [ ] Update `packages/coding-agent/README.md`
  - [ ] Add `--debug-api` flag to CLI reference
  - [ ] Add usage examples

## Step 7: Add Tests
- [ ] Create `packages/ai/test/debug-logging.test.ts`
  - [ ] Test `onRequestLog` callback is called with correct data
  - [ ] Test `onResponseLog` callback is called for each chunk
  - [ ] Test `PI_DEBUG_API` environment variable enables logging
  - [ ] Test logging doesn't interfere with normal stream operation
  - [ ] Test JSON mode compatibility (logs to stderr)
  - [ ] Test RPC mode compatibility (logs to stderr)

## Step 8: Build and Verify
- [x] Run `npm run build` from repository root
- [ ] Run `npm run check` from repository root
- [ ] Run `npm test` to verify all tests pass
- [ ] Test locally with a real API call:
  ```bash
  PI_DEBUG_API=1 ./pi-test.sh "Hello"
  ```
- [ ] Verify logs go to stderr, not stdout
- [ ] Verify JSON mode works: `PI_DEBUG_API=1 ./pi-test.sh --mode json "Hello"`
- [ ] Verify pretty-print mode: `PI_DEBUG_API=pretty ./pi-test.sh "Hello"`

## Step 9: Update CHANGELOGs
- [ ] Add entry to `packages/ai/CHANGELOG.md`
- [ ] Add entry to `packages/coding-agent/CHANGELOG.md`

## Step 10: Final Review
- [ ] Review all changes for consistency
- [ ] Verify backward compatibility
- [ ] Check for any missing providers
- [ ] Ensure documentation is complete
