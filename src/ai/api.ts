import Constants from 'expo-constants';
import type { CoachLog, GeminiFeedback } from './types';

export function apiBase() {
  const env = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (env) return env;
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri;
  const host = String(hostUri || '')
    .replace(/^exp:\/\//, '')
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
  const tunnel = /expo\.dev|exp\.direct|ngrok|tunnel/i.test(host);
  if (host && !tunnel && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8787`;
  }
  return 'http://localhost:8787';
}

export async function fetchGeminiFeedback(log: CoachLog): Promise<GeminiFeedback> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(`${apiBase()}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || `Coach backend ${res.status}`);
    }
    const fb = body.feedback as GeminiFeedback | undefined;
    if (!fb || !Array.isArray(fb.functioning)) {
      throw new Error('Malformed Gemini feedback');
    }
    return fb;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Coach backend timed out');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
