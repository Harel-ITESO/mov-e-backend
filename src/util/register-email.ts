export function registerEmailSubject() {
    return 'Welcome to Mov-e';
}

export function registerEmailBodyHtml(otp: string) {
    return `<p>Hi! The code to confirm your email is ${otp}</p>`;
}

export function registerEmailBodyText(otp: string) {
    return `Hi! The code to confirm your email is ${otp}`;
}
