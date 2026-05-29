// Rate limiter in-memory simple. Sirve para 1 instancia.
// Para escala multi-instancia migrar a Upstash Ratelimit.
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number },
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    const fresh = { count: 1, resetAt: now + opts.windowMs }
    buckets.set(key, fresh)
    return { ok: true, remaining: opts.max - 1, resetAt: fresh.resetAt }
  }
  bucket.count++
  const ok = bucket.count <= opts.max
  return { ok, remaining: Math.max(0, opts.max - bucket.count), resetAt: bucket.resetAt }
}

export function ipFromRequest(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
