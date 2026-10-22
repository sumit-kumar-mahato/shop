import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

// Used to keep login timing the same whether or not the email exists.
let dummyHash: string | null = null;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) {
    dummyHash ??= await bcrypt.hash("timing-equaliser", ROUNDS);
    await bcrypt.compare(password, dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}
