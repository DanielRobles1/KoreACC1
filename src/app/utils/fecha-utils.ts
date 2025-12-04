export const pad2 = (n: number): string => String(n).padStart(2, '0');

export const isISODate = (s: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(s);

export function fmtDate(d: unknown, fallback: string = '—'): string {
    if (d === null || d === undefined || d === '') return fallback;

    const s = String(d);
    if (isISODate(s)) return s;

    const dt = new Date(s);
    if (isNaN(dt.getTime())) return s;

    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function toDateOrNull(v: unknown): string | null {
    if (v === null || v === undefined || v === '') return null;

    const s = String(v);
    if (isISODate(s)) return s;

    const d = new Date(s);
    if (isNaN(d.getTime())) return null;

    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function toDateUTC(v: unknown): Date | null {
    if (v === null || v === undefined || v === '') return null;
    const s = String(v).trim();

    if (isISODate(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1, d));
    }

    const d2 = new Date(s);
    return isNaN(d2.getTime()) ? null : d2;
}

export function periodoEtiqueta(ini: unknown, fin: unknown): string {
    const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const di = toDateUTC(ini);
    const df = toDateUTC(fin);

    const d2 = (d: Date) => pad2(d.getUTCDate());

    if (di && df) {
        const yi = di.getUTCFullYear(), yf = df.getUTCFullYear();
        const mi = di.getUTCMonth(), mf = df.getUTCMonth();
        return (yi === yf)
            ? `${MESES_CORTOS[mi]} ${d2(di)}–${MESES_CORTOS[mf]} ${d2(df)} ${yi}`
            : `${MESES_CORTOS[mi]} ${d2(di)} ${yi} — ${MESES_CORTOS[mf]} ${d2(df)} ${yf}`;
    }
    if (di) return `${MESES_CORTOS[di.getUTCMonth()]} ${di.getUTCFullYear()}`;
    if (df) return `${MESES_CORTOS[df.getUTCMonth()]} ${df.getUTCFullYear()}`;
    return '—';
}

export function toDateSafe(v: unknown): Date | null {
    if (v === null || v === undefined || v === '') return null;
    const s = String(v).trim();
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}