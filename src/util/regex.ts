/**
 * Validate if a string is a valid id (numeric id in database)
 * @param id The string to validate
 * @returns True if the string is a valid id, otherwise false
 */
export function isValidId(id: string) {
    const regex = new RegExp(/^\d+$/);
    return regex.test(id);
}
