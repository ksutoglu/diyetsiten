import type { APIRoute } from 'astro';

import {
  clearFailures,
  cookieMaxAge,
  cookieName,
  createSession,
  getToken,
  passwordSource,
  readSession,
  recordFailure,
  savePassword,
  saveToken,
  tokenHint,
  tokenSource,
  tooManyAttempts,
  verifyPassword,
} from '~/lib/admin/auth';
import { getType, validateDoc } from '~/lib/admin/model';
import { checkToken, listDocs, optionsFor, overview, readDoc, removeDoc, saveDoc, uploadImage } from '~/lib/admin/sanity';

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

function authed(cookies: { get: (name: string) => { value: string } | undefined }): boolean {
  return readSession(cookies.get(cookieName())?.value);
}

function setSessionCookie(cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void }) {
  cookies.set(cookieName(), createSession(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: import.meta.env.PROD,
    maxAge: cookieMaxAge(),
  });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const data = (await request.json()) as unknown;
  return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : {};
}

function validId(id: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(id);
}

function passwordError(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 6) return 'Şifre en az 6 karakter olmalı.';
  if (password.length > 128) return 'Şifre çok uzun.';
  return null;
}

function sanityError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/unauthorized|permission|insufficient|401|403/i.test(message)) {
    return 'Kayıt yapılamadı.';
  }
  return 'Kayıt yapılamadı.';
}

async function requireWrite() {
  if (!getToken()) {
    return json({ error: 'Kayıt yapılamadı.' }, 400);
  }
  return null;
}

const handle: APIRoute = async ({ request, cookies, params }) => {
  const parts = (params.path ?? '').split('/').filter(Boolean);
  const [head, a, b] = parts;
  const method = request.method;

  if (method === 'GET' && head === 'session' && parts.length === 1) {
    return json({
      configured: passwordSource() !== 'none',
      authenticated: authed(cookies),
      tokenSet: tokenSource() !== 'none',
    });
  }

  if (method === 'POST' && head === 'setup' && parts.length === 1) {
    if (passwordSource() !== 'none') return json({ error: 'Kurulum zaten yapılmış.' }, 403);
    const body = await readBody(request);
    const problem = passwordError(body.password);
    if (problem) return json({ error: problem }, 400);
    if (typeof body.password !== 'string' || body.password !== body.passwordConfirm) {
      return json({ error: 'Şifreler aynı değil.' }, 400);
    }
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (token) {
      try {
        await checkToken(token);
      } catch {
        return json({ error: 'Kayıt yapılamadı.' }, 400);
      }
      saveToken(token);
    }
    savePassword(body.password);
    setSessionCookie(cookies);
    return json({ ok: true });
  }

  if (method === 'POST' && head === 'login' && parts.length === 1) {
    const ip = clientIp(request);
    if (tooManyAttempts(ip)) return json({ error: 'Çok fazla deneme. Biraz sonra tekrar dene.' }, 429);
    if (passwordSource() === 'none') return json({ error: 'Önce kurulum yapılmalı.' }, 409);
    const body = await readBody(request);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!verifyPassword(password)) {
      recordFailure(ip);
      return json({ error: 'Şifre yanlış.' }, 401);
    }
    clearFailures(ip);
    setSessionCookie(cookies);
    return json({ ok: true });
  }

  if (method === 'POST' && head === 'logout' && parts.length === 1) {
    cookies.delete(cookieName(), { path: '/' });
    return json({ ok: true });
  }

  if (!authed(cookies)) return json({ error: 'Giriş gerekli.' }, 401);

  try {
    if (method === 'GET' && head === 'overview' && parts.length === 1) {
      return json(await overview());
    }

    if (method === 'GET' && head === 'panel' && parts.length === 1) {
      return json({
        passwordFromEnv: passwordSource() === 'env',
        tokenFromEnv: tokenSource() === 'env',
        tokenSet: Boolean(getToken()),
        tokenHint: tokenHint(),
      });
    }

    if (method === 'PUT' && head === 'panel' && parts.length === 1) {
      const body = await readBody(request);
      if (typeof body.password === 'string' && body.password) {
        if (passwordSource() === 'env') return json({ error: 'Şifre ADMIN_PASSWORD ortam değişkeninden geliyor.' }, 400);
        const problem = passwordError(body.password);
        if (problem) return json({ error: problem }, 400);
        savePassword(body.password);
      }
      if (typeof body.token === 'string') {
        if (tokenSource() === 'env') return json({ error: 'Anahtar SANITY_API_TOKEN ortam değişkeninden geliyor.' }, 400);
        const token = body.token.trim();
        if (!token) {
          saveToken('');
        } else {
          try {
            await checkToken(token);
          } catch {
            return json({ error: 'Kayıt yapılamadı.' }, 400);
          }
          saveToken(token);
        }
      }
      return json({ ok: true, tokenSet: Boolean(getToken()), tokenHint: tokenHint() });
    }

    if (method === 'GET' && head === 'list' && a && parts.length === 2) {
      const type = getType(a);
      if (!type || type.singleton) return json({ error: 'Liste yok.' }, 404);
      return json({ items: await listDocs(type) });
    }

    if (method === 'GET' && head === 'options' && a && parts.length === 2) {
      const type = getType(a);
      if (!type) return json({ error: 'Tür yok.' }, 404);
      return json({ items: await optionsFor(a) });
    }

    if (method === 'GET' && head === 'doc' && a && b && parts.length === 3) {
      const type = getType(a);
      if (!type || !validId(b)) return json({ error: 'Kayıt yok.' }, 404);
      if (type.singleton && b !== type.singleton) return json({ error: 'Kayıt yok.' }, 404);
      const doc = await readDoc(b);
      return json({ doc });
    }

    if (method === 'POST' && head === 'doc' && a && parts.length === 2) {
      const type = getType(a);
      if (!type || type.singleton) return json({ error: 'Bu türden yeni kayıt açılamaz.' }, 400);
      const blocked = await requireWrite();
      if (blocked) return blocked;
      const body = await readBody(request);
      const problem = validateDoc(type, body);
      if (problem) return json({ error: problem }, 400);
      const id = crypto.randomUUID();
      await saveDoc(type, id, body);
      return json({ _id: id });
    }

    if (method === 'PUT' && head === 'doc' && a && b && parts.length === 3) {
      const type = getType(a);
      if (!type || !validId(b)) return json({ error: 'Kayıt yok.' }, 404);
      if (type.singleton && b !== type.singleton) return json({ error: 'Kayıt yok.' }, 404);
      const blocked = await requireWrite();
      if (blocked) return blocked;
      const body = await readBody(request);
      const problem = validateDoc(type, body);
      if (problem) return json({ error: problem }, 400);
      await saveDoc(type, b, body);
      return json({ ok: true });
    }

    if (method === 'DELETE' && head === 'doc' && a && b && parts.length === 3) {
      const type = getType(a);
      if (!type || type.singleton || !validId(b)) return json({ error: 'Bu kayıt silinemez.' }, 400);
      const blocked = await requireWrite();
      if (blocked) return blocked;
      await removeDoc(b);
      return json({ ok: true });
    }

    if (method === 'POST' && head === 'upload' && parts.length === 1) {
      const blocked = await requireWrite();
      if (blocked) return blocked;
      const form = await request.formData();
      const file = form.get('file');
      if (!(file instanceof File)) return json({ error: 'Görsel seçilmedi.' }, 400);
      if (file.size > 8 * 1024 * 1024) return json({ error: 'Görsel 8 MB’dan küçük olmalı.' }, 400);
      if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return json({ error: 'JPG, PNG, WEBP, GIF veya AVIF yükle.' }, 400);
      const asset = await uploadImage(Buffer.from(await file.arrayBuffer()), file.name || 'gorsel', file.type);
      return json(asset);
    }
  } catch (error) {
    return json({ error: sanityError(error) }, 502);
  }

  return json({ error: 'İstek yok.' }, 404);
};

export const GET: APIRoute = (context) => handle(context);
export const POST: APIRoute = (context) => handle(context);
export const PUT: APIRoute = (context) => handle(context);
export const DELETE: APIRoute = (context) => handle(context);
