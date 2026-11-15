import { API_BASE, ApiError, authHeaders } from './api';
import type { VerifyResult } from './verify';

export type StreamEvent =
  | { type: 'checks'; checks: VerifyResult }
  | { type: 'token'; text: string }
  | { type: 'done'; text: string; fallback: boolean; remaining: number; language: 'lo' | 'en' };

// POST /assistant/stream: newline-delimited JSON events. onEvent is called for each one as it arrives.
export async function streamAssistant(body: { text: string; mode: string; kind: string; band: string; lang: string }, onEvent: (e: StreamEvent) => void, signal?: AbortSignal) {
  let response: Response;
  try { response = await fetch(API_BASE + '/assistant/stream', { method: 'POST', signal, headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) }); }
  catch { throw new ApiError('Cannot reach the service.', 0); }
  if (!response.ok || !response.body) {
    const value = await response.json().catch(() => ({}));
    throw new ApiError(value.error || 'Request failed.', response.status);
  }
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = '';
  const flush = (line: string) => { if (!line.trim()) return; try { onEvent(JSON.parse(line)); } catch { /* ignore a broken line */ } };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
    lines.forEach(flush);
  }
  flush(buffer);
}
