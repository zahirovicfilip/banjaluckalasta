import { NextResponse } from 'next/server';

export type Prijava = {
  name: string;
  age: number;
  contact: string;
  level: string;
  message?: string;
};

/**
 * Receives join applications from the form.
 * TODO: deliver them somewhere real (e-mail via Resend, a Google Sheet, Notion...).
 * For now it validates and logs on the server.
 */
export async function POST(req: Request) {
  let body: Partial<Prijava>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtjev.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const contact = String(body.contact ?? '').trim();
  const age = Number(body.age);
  const level = String(body.level ?? '').trim();

  if (name.length < 2 || contact.length < 5 || !Number.isFinite(age) || age < 8 || age > 99 || !level) {
    return NextResponse.json({ error: 'Provjeri polja i pokušaj ponovo.' }, { status: 422 });
  }

  console.log('[prijava]', { name, age, contact, level, message: String(body.message ?? '').slice(0, 2000) });
  return NextResponse.json({ ok: true });
}
