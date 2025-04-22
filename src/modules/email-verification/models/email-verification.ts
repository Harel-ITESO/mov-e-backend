import { AttributeValue } from '@aws-sdk/client-dynamodb';

export class EmailVerification {
    constructor(
        public readonly verificationId: string,
        public readonly email: string,
        public readonly createdAt: number, // timestamp
        public readonly expiresAt: number, // timestamp
    ) {}

    public static fromDynamoItem(
        item: Record<string, AttributeValue>,
    ): EmailVerification {
        return {
            verificationId: item.verificationId.S!,
            email: item.email.S!,
            createdAt: parseInt(item.createdAt.N!),
            expiresAt: parseInt(item.expiresAt.N!),
        };
    }
}
