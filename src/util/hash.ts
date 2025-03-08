import * as bcrypt from 'bcrypt';

/**
 *  Generate hash with random salt
 * @param str
 * @returns
 */
export async function hashString(str: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(str, salt);
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
