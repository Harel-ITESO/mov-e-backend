export type OneTimePassword = {
    email: { S: string };
    otp?: { S: string };
    expiration?: { N: string };
};
