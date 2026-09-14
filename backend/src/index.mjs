import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

const FEEDBACK_SCHEMA = {
  type: 'OBJECT',
  properties: {
    functioning: {
      type: 'ARRAY',
      description: 'What was working in this set — ROM, tempo, joint path, symmetry, core.',
      items: {
        type: 'OBJECT',
        properties: {
          area: { type: 'STRING', description: 'Short label, e.g. Elbow path' },
          detail: { type: 'STRING', description: '1-2 sentences to the lifter about what was solid.' },
        },
        required: ['area', 'detail'],
      },
    },
    wentWrong: {
      type: 'ARRAY',
      description: 'Where the lifter went wrong, tied to fault codes and rep numbers from the log.',
      items: {
        type: 'OBJECT',
        properties: {
          where: { type: 'STRING', description: 'Joint, side, or phase that broke.' },
          detail: { type: 'STRING', description: 'What happened, in plain coaching language.' },
          reps: { type: 'STRING', description: 'Rep numbers, e.g. "3, 5" or "none".' },
        },
        required: ['where', 'detail', 'reps'],
      },
    },
    improvements: {
      type: 'ARRAY',
      description: 'What to change on the next set.',
      items: {
        type: 'OBJECT',
        properties: {
          area: { type: 'STRING' },
          detail: { type: 'STRING' },
          cue: { type: 'STRING', description: 'One short spoken cue.' },
        },
        required: ['area', 'detail', 'cue'],
      },
    },
    diagnosis: { type: 'STRING', description: 'One-line primary diagnosis.' },
    why: { type: 'STRING', description: 'Why the main breakdown happened biomechanically.' },
    cue: { type: 'STRING', description: 'The single cue for the next set.' },
    muscles: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          label: { type: 'STRING' },
          hot: { type: 'BOOLEAN', description: 'true if this tissue was overloaded by the fault.' },
        },
        required: ['label', 'hot'],
      },
    },
  },
  required: ['functioning', 'wentWrong', 'improvements', 'diagnosis', 'why', 'cue', 'muscles'],
};

const SYSTEM = `You are Spotter, an on-device gym form coach.

You receive a computer-vision log from a live set: exercise, equipment, committed reps, elbow angles, FSM states (IDLE, CONCENTRIC, PEAK, ECCENTRIC), and form-fault events with joint angles vs thresholds.

Speak directly to the lifter in plain English. Do not mention JSON, models, or the log format.
Ground every claim in the numbers. If a fault code is absent, do not invent it.
If the set was clean, functioning should still name 2-3 things that held, wentWrong should be empty, and improvements can be a small next-step (fuller ROM or load).
Cues must be short enough to say between reps.`;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, body) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 800_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseModelJson(text) {
  if (!text) throw new Error('empty model output');
  const trimmed = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(trimmed);
}

async function geminiFeedback(log) {
  if (!API_KEY) {
    const err = new Error('GEMINI_API_KEY is not set');
    err.status = 503;
    throw err;
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `${SYSTEM}

Live set log:
${JSON.stringify(log)}`;

  const result = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: FEEDBACK_SCHEMA,
    },
  });
  return parseModelJson(result.text);
}

const server = createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { ok: true, gemini: Boolean(API_KEY), model: MODEL });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/feedback') {
    try {
      const raw = await readBody(req);
      const log = JSON.parse(raw || '{}');
      if (!log?.session?.exercise) {
        json(res, 400, { error: 'session.exercise is required' });
        return;
      }
      const feedback = await geminiFeedback(log);
      json(res, 200, { source: 'gemini', model: MODEL, feedback });
    } catch (err) {
      const status = err.status || (String(err.message).includes('payload') ? 413 : 500);
      json(res, status, { error: err.message || 'gemini failed' });
    }
    return;
  }

  json(res, 404, { error: 'not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Spotter Gemini coach on http://0.0.0.0:${PORT}`);
  if (!API_KEY) console.warn('Missing GEMINI_API_KEY — copy backend/.env.example to backend/.env');
});
