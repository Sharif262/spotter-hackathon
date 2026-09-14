import * as SQLite from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import type { EquipmentKind, ExerciseId, FaultEvent } from '../cv/exercises';
import type { SampleRow } from '../cv/engine';
export type { SampleRow };
import type { FsmState } from '../cv/fsm';

export type SessionRow = {
  id: number;
  startedAt: number;
  endedAt: number | null;
  exercise: ExerciseId;
  equipment: EquipmentKind;
  lift: string;
  reps: number;
  faultCount?: number;
};

export type FaultRow = FaultEvent & {
  id: number;
  sessionId: number;
  t: number;
  fsm: FsmState;
  rep: number;
};

export type RepRow = {
  id: number;
  sessionId: number;
  t: number;
  n: number;
  leftAngle: number;
  rightAngle: number;
};

const mem = {
  sessions: new Map<number, SessionRow>(),
  samples: new Map<number, SampleRow[]>(),
  faults: new Map<number, FaultRow[]>(),
  reps: new Map<number, RepRow[]>(),
  nextId: 1,
  nextFault: 1,
  nextRep: 1,
};

let db: SQLite.SQLiteDatabase | null = null;
let sqliteOk: boolean | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('spotter.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        exercise TEXT NOT NULL,
        equipment TEXT NOT NULL,
        lift TEXT NOT NULL,
        reps INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        t INTEGER NOT NULL,
        exercise TEXT,
        side TEXT,
        fsm TEXT,
        elbow_deg REAL,
        fault_code TEXT,
        cue TEXT,
        rep INTEGER
      );
      CREATE TABLE IF NOT EXISTS faults (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        t INTEGER NOT NULL,
        code TEXT,
        cue TEXT,
        severity TEXT,
        side TEXT,
        angle REAL,
        threshold REAL,
        joint TEXT,
        fsm TEXT,
        rep INTEGER
      );
      CREATE TABLE IF NOT EXISTS reps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        t INTEGER NOT NULL,
        n INTEGER,
        left_angle REAL,
        right_angle REAL
      );
    `);
  }
  return db;
}

async function sql() {
  if (sqliteOk === false) return null;
  try {
    const database = await getDb();
    sqliteOk = true;
    return database;
  } catch {
    sqliteOk = false;
    return null;
  }
}

function appendCsv(line: string) {
  try {
    const file = new File(Paths.document, 'spotter-events.csv');
    if (!file.exists) {
      file.create();
      file.write('t,session_id,exercise,side,fsm,elbow_deg,fault_code,cue,rep\n');
    }
    file.write(line.endsWith('\n') ? line : `${line}\n`, { append: true });
  } catch {
    // web / missing FS: sqlite or memory still holds the log
  }
}

function ensureMem(id: number) {
  if (!mem.samples.has(id)) mem.samples.set(id, []);
  if (!mem.faults.has(id)) mem.faults.set(id, []);
  if (!mem.reps.has(id)) mem.reps.set(id, []);
}

export async function startSession(lift: string, exercise: ExerciseId, equipment: EquipmentKind) {
  return beginSession(lift, exercise, equipment);
}

/** Immediate local session id so the first live frames are not dropped. */
export function beginSession(lift: string, exercise: ExerciseId, equipment: EquipmentKind) {
  const startedAt = Date.now();
  const id = mem.nextId++;
  mem.sessions.set(id, { id, startedAt, endedAt: null, exercise, equipment, lift, reps: 0, faultCount: 0 });
  ensureMem(id);
  void sql().then((database) => {
    if (!database) return;
    return database.runAsync(
      'INSERT OR IGNORE INTO sessions (id, started_at, exercise, equipment, lift, reps) VALUES (?, ?, ?, ?, ?, 0)',
      id,
      startedAt,
      exercise,
      equipment,
      lift,
    );
  }).catch(() => {});
  return id;
}

export async function logSample(sessionId: number, s: SampleRow) {
  ensureMem(sessionId);
  mem.samples.get(sessionId)!.push({ ...s });
  const database = await sql();
  if (database) {
    await database.runAsync(
      `INSERT INTO samples (session_id, t, exercise, side, fsm, elbow_deg, fault_code, cue, rep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      sessionId, s.t, s.exercise, s.side, s.fsm, s.elbowDeg, s.faultCode, s.cue, s.rep,
    );
  }
  appendCsv(
    `${s.t},${sessionId},${s.exercise},${s.side},${s.fsm},${s.elbowDeg},"${s.faultCode}","${s.cue.replace(/"/g, "'")}",${s.rep}`,
  );
}

export async function logFault(sessionId: number, t: number, fsm: FsmState, rep: number, f: FaultEvent) {
  ensureMem(sessionId);
  mem.faults.get(sessionId)!.push({
    id: mem.nextFault++,
    sessionId,
    t,
    fsm,
    rep,
    ...f,
  });
  const session = mem.sessions.get(sessionId);
  if (session) session.faultCount = (session.faultCount ?? 0) + 1;
  const database = await sql();
  if (database) {
    await database.runAsync(
      `INSERT INTO faults (session_id, t, code, cue, severity, side, angle, threshold, joint, fsm, rep)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      sessionId, t, f.code, f.cue, f.severity, f.side, f.angle, f.threshold, f.joint, fsm, rep,
    );
  }
}

export async function logRep(sessionId: number, t: number, n: number, leftAngle: number, rightAngle: number) {
  ensureMem(sessionId);
  mem.reps.get(sessionId)!.push({
    id: mem.nextRep++,
    sessionId,
    t,
    n,
    leftAngle,
    rightAngle,
  });
  const database = await sql();
  if (database) {
    await database.runAsync(
      'INSERT INTO reps (session_id, t, n, left_angle, right_angle) VALUES (?, ?, ?, ?, ?)',
      sessionId, t, n, leftAngle, rightAngle,
    );
  }
}

export async function finishSession(sessionId: number, reps: number) {
  const session = mem.sessions.get(sessionId);
  if (session) {
    session.endedAt = Date.now();
    session.reps = reps;
  }
  const database = await sql();
  if (database) {
    await database.runAsync(
      'UPDATE sessions SET ended_at = ?, reps = ? WHERE id = ?',
      Date.now(),
      reps,
      sessionId,
    );
  }
}

export async function getSession(id: number): Promise<SessionRow | null> {
  const local = mem.sessions.get(id);
  if (local) {
    return { ...local, faultCount: mem.faults.get(id)?.length ?? local.faultCount ?? 0 };
  }
  const database = await sql();
  if (!database) return null;
  const row = await database.getFirstAsync<{
    id: number; started_at: number; ended_at: number | null; exercise: ExerciseId;
    equipment: EquipmentKind; lift: string; reps: number; fault_count?: number;
  }>('SELECT *, (SELECT COUNT(*) FROM faults f WHERE f.session_id = sessions.id) as fault_count FROM sessions WHERE id = ?', id);
  if (!row) return null;
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    exercise: row.exercise,
    equipment: row.equipment,
    lift: row.lift,
    reps: row.reps,
    faultCount: Number(row.fault_count ?? 0),
  };
}

export async function getFaults(sessionId: number): Promise<FaultRow[]> {
  const local = mem.faults.get(sessionId);
  if (local) return [...local];
  const database = await sql();
  if (!database) return [];
  const rows = await database.getAllAsync<{
    id: number; session_id: number; t: number; code: string; cue: string; severity: 'warn' | 'high';
    side: FaultEvent['side']; angle: number; threshold: number; joint: string; fsm: FsmState; rep: number;
  }>('SELECT * FROM faults WHERE session_id = ? ORDER BY t ASC', sessionId);
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    t: r.t,
    code: r.code,
    cue: r.cue,
    severity: r.severity,
    side: r.side,
    angle: r.angle,
    threshold: r.threshold,
    joint: r.joint,
    fsm: r.fsm,
    rep: r.rep,
  }));
}

export async function getReps(sessionId: number): Promise<RepRow[]> {
  const local = mem.reps.get(sessionId);
  if (local) return [...local];
  const database = await sql();
  if (!database) return [];
  const rows = await database.getAllAsync<{
    id: number; session_id: number; t: number; n: number; left_angle: number; right_angle: number;
  }>('SELECT * FROM reps WHERE session_id = ? ORDER BY n ASC', sessionId);
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    t: r.t,
    n: r.n,
    leftAngle: r.left_angle,
    rightAngle: r.right_angle,
  }));
}

export async function getSamples(sessionId: number): Promise<SampleRow[]> {
  const local = mem.samples.get(sessionId);
  if (local) return [...local];
  const database = await sql();
  if (!database) return [];
  return database.getAllAsync<SampleRow>(
    'SELECT t, exercise, side, fsm, elbow_deg as elbowDeg, fault_code as faultCode, cue, rep FROM samples WHERE session_id = ? ORDER BY t ASC',
    sessionId,
  );
}

export async function recentSessions(limit = 12): Promise<SessionRow[]> {
  const local = [...mem.sessions.values()].map((s) => ({
    ...s,
    faultCount: mem.faults.get(s.id)?.length ?? s.faultCount ?? 0,
  }));
  const database = await sql();
  if (!database) {
    return local.sort((a, b) => b.startedAt - a.startedAt).slice(0, limit);
  }
  const rows = await database.getAllAsync<{
    id: number; started_at: number; ended_at: number | null; exercise: ExerciseId;
    equipment: EquipmentKind; lift: string; reps: number; fault_count: number;
  }>('SELECT s.*, (SELECT COUNT(*) FROM faults f WHERE f.session_id = s.id) as fault_count FROM sessions s ORDER BY started_at DESC LIMIT ?', limit);
  const byId = new Map<number, SessionRow>(rows.map((row) => [row.id, {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    exercise: row.exercise,
    equipment: row.equipment,
    lift: row.lift,
    reps: row.reps,
    faultCount: Number(row.fault_count ?? 0),
  }]));
  for (const s of local) byId.set(s.id, s);
  return [...byId.values()].sort((a, b) => b.startedAt - a.startedAt).slice(0, limit);
}
