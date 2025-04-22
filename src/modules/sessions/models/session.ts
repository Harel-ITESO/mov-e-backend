import { AttributeValue } from '@aws-sdk/client-dynamodb';

export class Session {
    constructor(
        public readonly sessionId: string,
        public readonly userId: number,
        public readonly username: string,
        public readonly email: string,
        public readonly issuedAt: number, // timestamp
        public readonly expiresAt: number, // timestamp
    ) {}

    public static fromDynamoItem(
        item: Record<string, AttributeValue>,
    ): Session {
        return {
            sessionId: item.sessionId.S!,
            username: item.username.S!,
            email: item.email.S!,
            userId: parseInt(item.userId.N!),
            issuedAt: parseInt(item.issuedAt.N!),
            expiresAt: parseInt(item.expiresAt.N!),
        };
    }
}
