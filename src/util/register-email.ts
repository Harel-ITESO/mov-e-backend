export function registerEmailSubject() {
    return 'Welcome to Mov-e';
}

export function registerEmailBody(otp: string) {
    return `Hi! The code to confirm your email is ${otp}`;
}
