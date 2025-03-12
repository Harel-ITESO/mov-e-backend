import * as bcrypt from 'bcrypt';

/**
 *  Generate hash with 12 steps
 * @param str
 * @returns
 */
export async function hashString(str: string) {
    return await bcrypt.hash(str, 12);
}

/**
 * Compares a hashed string with an unhashed one
 * @param hashed
 * @param unhashed
 * @returns
 */
export async function compareHash(hashed: string, unhashed: string) {
    return await bcrypt.compare(unhashed, hashed);
}
