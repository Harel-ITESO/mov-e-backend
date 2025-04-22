/**
 * Obtains time in milliseconds from a string ('1s', '1m', '1h', '1d')
 * @param time The time string
 * @returns The miliseconds of the time string
 */
export function calculateStringTime(time: string) {
    const stringItems = time.split('');
    const amount = stringItems.slice(0, -1).join('');
    const unity = stringItems[stringItems.length - 1];
    switch (unity) {
        case 's':
            return parseInt(amount) * 1000;
        case 'm':
            return parseInt(amount) * 60000;
        case 'h':
            return parseInt(amount) * 3600000;
        case 'd':
            return parseInt(amount) * 86400000;
        default:
            return parseInt(amount);
    }
}
