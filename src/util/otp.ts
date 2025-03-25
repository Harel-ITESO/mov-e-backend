import crypto from 'crypto-random-string';

export enum OTP_TYPES {
    NUMERIC = 'numeric',
    ALPHANUMERIC = 'alphanumeric'
}

/**
 * Creates a random one time password
 * @param length The OTP length
 * @param type The OTP type (available options in OTP_TYPES enum)
 * @returns The OTP
 */
export function createOneTimePassword(length: number, type: OTP_TYPES) {
    const otp = crypto({ length, type });
    return otp;
}
