// ROME-TAG: 0x92EED4

import { Request, Response, NextFunction } from 'express';

export function requireQflushToken(req: Request, res: Response, next: NextFunction) {
  const token = process.env.QFLUSH_TOKEN || '';
  if (!token) return res.status(401).json({ success: false, error: 'QFLUSH_TOKEN not configured on server' });
  const header = req.headers['x-qflush-token'] as string | undefined;
  if (!header || header !== token) return res.status(403).json({ success: false, error: 'invalid token' });
  return next();
}

export function requireNpzToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-qflush-token'] as string | undefined;

  if (!token) {
    return res.status(403).json({ error: 'missing token' });
  }

  const expected = process.env.QFLUSH_TEST_TOKEN || process.env.ACTIONS_TOKEN || undefined;
  if (!expected) {
    // if no expected token configured, reject as unauthorized
    return res.status(401).json({ error: 'invalid token' });
  }

  if (token !== expected) {
    return res.status(401).json({ error: 'invalid token' });
  }

  next();
}

export default { requireQflushToken, requireNpzToken };
