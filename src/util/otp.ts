import crypto from 'crypto-random-string';

export enum OTP_TYPES {
    NUMERIC = 'numeric',
    ALPHANUMERIC = 'alphanumeric'
}

export function createOneTimePassword(length: number, type: OTP_TYPES) {
    const otp = crypto({ length, type });
    return otp;
}
