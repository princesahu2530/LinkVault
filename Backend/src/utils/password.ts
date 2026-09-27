import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(ENV.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
