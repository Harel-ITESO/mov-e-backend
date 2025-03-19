export type OneTimePassword = {
    email: { S: string };
    opt?: { S: string };
    expiration?: { N: string };
};
