import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ADMIN_PASSWORD, ADMIN_SESSION_SECRET, SANITY_API_TOKEN, SANITY_API_WRITE_TOKEN } from 'astro:env/server';

function readSecret(value: string | undefined, name: string): string {
  if (typeof value === 'string' && value.length > 0) return value;
  const fromProcess = process.env[name];
  return typeof fromProcess === 'string' ? fromProcess : '';
}

function adminPassword(): string {
  return readSecret(ADMIN_PASSWORD, 'ADMIN_PASSWORD');
}

function sessionSecretValue(): string {
  return readSecret(ADMIN_SESSION_SECRET, 'ADMIN_SESSION_SECRET');
}

function sanityTokenFromEnv(): string {
  return readSecret(SANITY_API_TOKEN, 'SANITY_API_TOKEN') || readSecret(SANITY_API_WRITE_TOKEN, 'SANITY_API_WRITE_TOKEN');
}

interface AdminConfig {
  passwordHash: string;
  sanityToken: string;
  sessionSecret: string;
}

const filePath = path.join(process.cwd(), 'data', 'admin-config.json');
const COOKIE = 'dy_admin';
const TWO_WEEKS = 60 * 60 * 24 * 14;

let cache: AdminConfig | null = null;

function emptyConfig(): AdminConfig {
  return { passwordHash: '', sanityToken: '', sessionSecret: '' };
}

function readDisk(): AdminConfig {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Partial<AdminConfig>;
    return {
      passwordHash: typeof parsed.passwordHash === 'string' ? parsed.passwordHash : '',
      sanityToken: typeof parsed.sanityToken === 'string' ? parsed.sanityToken : '',
      sessionSecret: typeof parsed.sessionSecret === 'string' ? parsed.sessionSecret : '',
    };
  } catch {
    return emptyConfig();
  }
}

function writeDisk(config: AdminConfig) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 });
  cache = config;
}

export function getConfig(): AdminConfig {
  if (cache) return cache;
  const stored = readDisk();
  const secretFromEnv = sessionSecretValue();
  if (!secretFromEnv && !stored.sessionSecret) {
    stored.sessionSecret = randomBytes(32).toString('hex');
    writeDisk(stored);
  } else if (!stored.sessionSecret && secretFromEnv) {
    stored.sessionSecret = secretFromEnv;
  }
  cache = stored;
  return stored;
}

export function passwordSource(): 'env' | 'file' | 'none' {
  if (adminPassword()) return 'env';
  if (getConfig().passwordHash) return 'file';
  return 'none';
}

export function tokenSource(): 'env' | 'file' | 'none' {
  if (sanityTokenFromEnv()) return 'env';
  if (getConfig().sanityToken) return 'file';
  return 'none';
}

export function getToken(): string {
  return sanityTokenFromEnv() || getConfig().sanityToken || '';
}

export function tokenHint(): string {
  const token = getToken();
  if (token.length < 10) return token ? '••••' : '';
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

function sessionSecret(): string {
  return sessionSecretValue() || getConfig().sessionSecret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function sameText(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function verifyPassword(password: string): boolean {
  const fromEnv = adminPassword();
  if (fromEnv) return sameText(password, fromEnv);
  const stored = getConfig().passwordHash;
  const [algo, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function savePassword(password: string) {
  const config = getConfig();
  writeDisk({ ...config, passwordHash: hashPassword(password) });
}

export function saveToken(token: string) {
  const config = getConfig();
  writeDisk({ ...config, sanityToken: token.trim() });
}

export function createSession(): string {
  const exp = Date.now() + TWO_WEEKS * 1000;
  const payload = `${exp}.${randomBytes(16).toString('hex')}`;
  const sig = createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function readSession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  const payload = `${exp}.${nonce}`;
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

export function cookieName(): string {
  return COOKIE;
}

export function cookieMaxAge(): number {
  return TWO_WEEKS;
}

const attempts = new Map<string, { count: number; since: number }>();

export function tooManyAttempts(ip: string): boolean {
  const row = attempts.get(ip);
  if (!row) return false;
  if (Date.now() - row.since > 10 * 60 * 1000) {
    attempts.delete(ip);
    return false;
  }
  return row.count >= 8;
}

export function recordFailure(ip: string) {
  const row = attempts.get(ip);
  if (!row || Date.now() - row.since > 10 * 60 * 1000) {
    attempts.set(ip, { count: 1, since: Date.now() });
    return;
  }
  row.count += 1;
}

export function clearFailures(ip: string) {
  attempts.delete(ip);
}
