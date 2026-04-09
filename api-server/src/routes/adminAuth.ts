import { Router } from "express";
import crypto from "crypto";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_HASH  = process.env.ADMIN_PASSWORD_HASH ?? "";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "fallback-secret";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function signToken(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length < 3) return false;
    const sig = parts.pop()!;
    const payload = parts.join(":");
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    const tokenTimestamp = parseInt(parts[1] ?? "0");
    const ageMs = Date.now() - tokenTimestamp;
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    return sig === expected && ageMs < maxAgeMs;
  } catch {
    return false;
  }
}

router.post("/admin/login", (req, res): void => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const emailMatch = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const passMatch  = hashPassword(password) === ADMIN_HASH;
  if (!emailMatch || !passMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken(email.trim().toLowerCase());
  res.json({ token });
});

router.get("/admin/verify", (req, res): void => {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !verifyToken(token)) {
    res.status(401).json({ valid: false });
    return;
  }
  res.json({ valid: true });
});

export default router;
