/**
 * Debug logging utilities for raw API traffic inspection.
 * Enables logging of full HTTP requests, responses, and errors.
 */

import type { ApiDebugLog, ApiErrorLog, ApiRequestLog, ApiResponseLog } from "./types.js";

export type DebugLogLevel = "pretty" | "json" | "compact";

/**
 * Parse the PI_DEBUG_API environment variable.
 * Returns the log level if enabled, undefined otherwise.
 */
export function parseDebugLogLevel(): DebugLogLevel | undefined {
	const value = process.env.PI_DEBUG_API;
	if (!value) return undefined;

	const trimmed = value.trim().toLowerCase();
	if (trimmed === "1" || trimmed === "true" || trimmed === "") {
		return "pretty";
	}
	if (trimmed === "pretty" || trimmed === "json" || trimmed === "compact") {
		return trimmed;
	}
	return undefined;
}

/**
 * Check if debug logging is enabled.
 */
export function isDebugEnabled(): boolean {
	return parseDebugLogLevel() !== undefined;
}

/**
 * Get the current debug log level.
 */
export function getDebugLogLevel(): DebugLogLevel {
	return parseDebugLogLevel() ?? "pretty";
}

/**
 * Format a debug log entry based on the current log level.
 */
export function formatDebugLog(log: ApiDebugLog, level: DebugLogLevel = "pretty"): string {
	switch (level) {
		case "json":
			return JSON.stringify(log);
		case "compact":
			return formatCompact(log);
		default:
			return formatPretty(log);
	}
}

/**
 * Format log entry in pretty (human-readable) format.
 */
function formatPretty(log: ApiDebugLog): string {
	const timestamp = new Date(log.timestamp).toISOString();

	switch (log.type) {
		case "request":
			return `[${timestamp}] ${log.provider}:${log.model} → ${log.method} ${log.url || "N/A"}
${formatJsonPretty(log.body)}`;

		case "response_chunk":
		case "response": {
			const prefix = log.type === "response_chunk" ? "chunk:" : "";
			return `[${timestamp}] ${log.provider}:${log.model} ← ${prefix}${log.chunkType || "data"}
${formatJsonPretty(log.data)}`;
		}

		case "error": {
			const statusStr = log.status ? ` [${log.status}]` : "";
			return `[${timestamp}] ${log.provider}:${log.model} ← ERROR${statusStr}
${formatJsonPretty(log.error)}`;
		}

		default:
			return JSON.stringify(log);
	}
}

/**
 * Format log entry in compact (single-line) format.
 */
function formatCompact(log: ApiDebugLog): string {
	switch (log.type) {
		case "request":
			return `→ ${log.provider}:${log.model} ${log.method} ${log.url || "N/A"}`;

		case "response_chunk":
			return `← ${log.provider}:${log.model} chunk:${log.chunkType || "data"}`;

		case "response":
			return `← ${log.provider}:${log.model} response`;

		case "error":
			return `← ${log.provider}:${log.model} ERROR ${log.status || ""}`;

		default:
			return JSON.stringify(log);
	}
}

/**
 * Format JSON value with proper indentation for pretty printing.
 */
function formatJsonPretty(value: unknown): string {
	if (value === undefined || value === null) return "null";
	if (typeof value === "string") return value;
	if (typeof value !== "object") return String(value);
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

/**
 * Write a debug log entry to stderr.
 */
export function writeDebugLog(log: ApiDebugLog): void {
	const level = getDebugLogLevel();
	const formatted = formatDebugLog(log, level);
	process.stderr.write(`${formatted}\n`);
}

/**
 * Create debug log callbacks that write to stderr.
 * Returns undefined if debug logging is not enabled.
 */
export function createDebugLogCallbacks(): {
	onRequestLog?: (log: ApiRequestLog) => void;
	onResponseLog?: (log: ApiResponseLog) => void;
	onErrorLog?: (log: ApiErrorLog) => void;
} {
	if (!isDebugEnabled()) {
		return {};
	}

	return {
		onRequestLog: (log) => writeDebugLog(log),
		onResponseLog: (log) => writeDebugLog(log),
		onErrorLog: (log) => writeDebugLog(log),
	};
}
