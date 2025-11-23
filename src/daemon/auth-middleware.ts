import { Request, Response, NextFunction } from 'express';

export function requireQflushToken(req: Request, res: Response, next: NextFunction) {
  const token = process.env.QFLUSH_TOKEN || '';
  if (!token) return res.status(401).json({ success: false, error: 'QFLUSH_TOKEN not configured on server' });
  const header = req.headers['x-qflush-token'] as string | undefined;
  if (!header || header !== token) return res.status(403).json({ success: false, error: 'invalid token' });
  return next();
}

export function requireNpzToken(req: Request, res: Response, next: NextFunction) {
  // Accept either x-qflush-token header or Authorization: Bearer <token>
  let token = req.headers['x-qflush-token'] as string | undefined;
  if (!token) {
    const auth = req.headers['authorization'] as string | undefined;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      token = auth.slice(7).trim();
    }
  }

  if (!token) {
    // tests expect 403 when token is missing
    return res.status(403).json({ error: 'missing token' });
  }

  const expected = process.env.QFLUSH_TEST_TOKEN || process.env.ACTIONS_TOKEN || undefined;

  if (!expected) {
    // if no expected token configured, return 401
    return res.status(401).json({ error: 'invalid token' });
  }

  if (token !== expected) {
    return res.status(401).json({ error: 'invalid token' });
  }

  return next();
}

export default { requireQflushToken, requireNpzToken };

