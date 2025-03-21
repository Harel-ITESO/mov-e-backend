export type Session = {
    sessionId: { S: string };
    userId?: { N: string };
    issuedAt?: { N: string };
    expiresAt?: { N: string };
};
