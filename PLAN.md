# Plan: Raw LLM Traffic Logs Feature

## Overview
Add functionality to output raw API requests and responses for debugging purposes. This will help users debug issues like rate limiting (429 errors) by showing the full HTTP payloads and bodies.

## Current State
- `--verbose` flag only enables verbose startup messages
- `--mode json` outputs parsed events, not raw HTTP data
- `StreamOptions` already has `onPayload` callback for request payloads
- Provider SDKs (Anthropic, OpenAI, Google) wrap HTTP calls internally

## Design Approach

### Option 1: Add Debug Callbacks to StreamOptions (Chosen)
Add new callback options to `StreamOptions`:
- `onRequestLog`: Called with request payload and headers
- `onResponseLog`: Called with raw response data as chunks arrive

**Advantages:**
- Backward compatible (optional callbacks)
- Works with all providers
- No need to modify SDK internals
- Can be enabled via environment variable or CLI flag

### Option 2: Environment Variable + Conditional Logging
- Add `PI_DEBUG_API` environment variable
- When set, enable debug logging at provider level
- Output to stderr to avoid interfering with JSON/RPC modes

**Advantages:**
- Simple for users
- No code changes needed in consumer code
- Easy to enable globally

**Chosen Approach:** Combine both - add debug callbacks to StreamOptions AND provide a simple `PI_DEBUG_API` env var that enables built-in logging.

## Implementation Steps

### 1. Update Type Definitions (packages/ai/src/types.ts)
- Add `onRequestLog` callback to `StreamOptions`
- Add `onResponseLog` callback to `StreamOptions`
- Define log types for request/response data

### 2. Update All Provider Implementations
For each provider in packages/ai/src/providers/:
- **google.ts**: Log request params, log stream chunks
- **anthropic.ts**: Log request params, log stream events
- **openai-completions.ts**: Log request params, log stream chunks
- **openai-responses.ts**: Log request params, log stream chunks
- **openai-codex-responses.ts**: Log request params, log stream chunks
- **azure-openai-responses.ts**: Log request params, log stream chunks
- **google-gemini-cli.ts**: Log request params, log stream chunks
- **google-vertex.ts**: Log request params, log stream chunks
- **amazon-bedrock.ts**: Log request params, log stream chunks

### 3. Add Built-in Debug Logger (packages/ai/src/debug-logger.ts)
- Check `PI_DEBUG_API` environment variable
- If enabled, automatically attach debug callbacks
- Log to stderr with timestamps and request IDs
- Format output for readability

### 4. Update CLI (packages/coding-agent)
- Add `--debug-api` flag to args.ts
- Pass debug flag to model/stream options
- Update help text

### 5. Update Documentation
- Update packages/ai/README.md with debug logging section
- Document `PI_DEBUG_API` environment variable
- Add examples of using debug logging
- Update packages/coding-agent/README.md with CLI flag info

### 6. Add Tests
- Test that debug callbacks are called correctly
- Test that `PI_DEBUG_API` enables logging
- Verify no interference with normal operation
- Test with JSON/RPC modes (logs go to stderr)

## File Structure

```
packages/ai/src/
├── types.ts (update)
├── debug-logger.ts (new)
├── env-api-keys.ts (update - add PI_DEBUG_API check)
└── providers/
    ├── google.ts (update)
    ├── anthropic.ts (update)
    ├── openai-completions.ts (update)
    ├── openai-responses.ts (update)
    ├── openai-codex-responses.ts (update)
    ├── azure-openai-responses.ts (update)
    ├── google-gemini-cli.ts (update)
    ├── google-vertex.ts (update)
    └── amazon-bedrock.ts (update)

packages/coding-agent/src/
├── cli/args.ts (update)
└── core/
    └── (pass debug flag through)

packages/ai/test/
└── debug-logging.test.ts (new)
```

## Log Format

### Request Log
```json
{
  "type": "request",
  "timestamp": 1700000000000,
  "provider": "anthropic",
  "model": "claude-sonnet-4",
  "url": "https://api.anthropic.com/v1/messages",
  "method": "POST",
  "headers": { ... },
  "body": { ... }
}
```

### Response Log (Streaming)
```json
{
  "type": "response_chunk",
  "timestamp": 1700000001000,
  "provider": "anthropic",
  "chunk_type": "content_block_delta",
  "data": { ... }
}
```

### Error Response
```json
{
  "type": "error",
  "timestamp": 1700000002000,
  "provider": "anthropic",
  "status": 429,
  "error": { ... }
}
```

## Environment Variables

- `PI_DEBUG_API=1` or `PI_DEBUG_API=true`: Enable debug logging
- `PI_DEBUG_API=pretty`: Enable pretty-printed logging (for human reading)
- `PI_DEBUG_API=json`: Enable JSON logging (for programmatic parsing)

## CLI Usage

```bash
# Enable debug logging via CLI flag
pi --debug-api "Hello, world!"

# Enable via environment variable
PI_DEBUG_API=1 pi "Hello, world!"

# Enable pretty-printed logs
PI_DEBUG_API=pretty pi "Hello, world!"

# Combine with JSON mode (logs go to stderr, events go to stdout)
PI_DEBUG_API=1 pi --mode json "Hello, world!"
```

## Backward Compatibility

- All changes are additive (optional callbacks)
- No breaking changes to existing APIs
- Default behavior unchanged (logging disabled)
- JSON/RPC modes unaffected (logs go to stderr)

## Future Enhancements

- Support log file output via `PI_DEBUG_API_LOG_FILE`
- Add request/response timing metrics
- Support filtering by provider or model
- Add redaction options for sensitive data
