import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 *  Generate hash with 12 steps
 * @param str
 * @returns
 */
export async function bcryptHashString(str: string) {
    return await bcrypt.hash(str, 12);
}

/**
 * Compares a hashed string with an unhashed one
 * @param hashed
 * @param unhashed
 * @returns
 */
export async function bcryptCompareHash(hashed: string, unhashed: string) {
    return await bcrypt.compare(unhashed, hashed);
}

/**
 * Creates a hash from a string using a fast algorithm
 * @param str String to hash
 * @param algorightm Algorithm to use
 * @returns hash
 */
export function hashString(str: string, algorightm: string) {
    return crypto.createHash(algorightm).update(str).digest('hex');
}
