/**
 * Email sent to new users with their one time password
 * @returns The email subject
 */
export function registerEmailSubject() {
    return 'Welcome to Mov-e';
}

/**
 * Email sent to new users with their one time password
 * @returns The HTML version of email body
 */
export function registerEmailBodyHtml(otp: string) {
    return `<p>Hi! The code to confirm your email is ${otp}</p>`;
}

/**
 * Email sent to new users with their one time password
 * @returns The text version of email body
 */
export function registerEmailBodyText(otp: string) {
    return `Hi! The code to confirm your email is ${otp}`;
}
