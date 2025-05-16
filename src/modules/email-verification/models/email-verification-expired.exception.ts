export class EmailVerificationExpiredException extends Error {
    constructor(message: string) {
        super(message);
    }
}
