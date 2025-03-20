import { Injectable } from '@nestjs/common';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { hashString } from 'src/util/hash';

@Injectable()
export class SessionService {
    constructor(private readonly dynamoService: DynamoService) {}

    /**
     * Delete a session by its ID
     * @param sessionId The ID of the session
     */
    public async deleteSession(sessionId: string) {
        await this.dynamoService.deleteItemFromTable('sessions', {
            sessionId: { S: sessionId },
        });
    }

    /**
     * Creates a new session based on user data
     * @param userId
     * @returns the session created
     */
    public async createSession(userId: number) {
        const sessionId = hashString(`${userId}-${Date.now()}`, 'sha256');
        const now = Date.now();
        const tenDays = now + 10 * 24 * 60 * 60 * 1000;
        const data = {
            sessionId: { S: sessionId },
            userId: { N: userId.toString() },
            issuedAt: { N: now.toString() },
            expiresAt: { N: tenDays.toString() },
        };
        await this.dynamoService.createItemOnTable('sessions', data);
        return { sessionId, expiresAt: tenDays };
    }

    /**
     * Finds a session by its ID, if the session is not found or it is expired, delete it and return `null`
     * @param sessionId
     * @returns
     */
    public async findSession(sessionId: string) {
        const session = await this.dynamoService.getItemFromTable('sessions', {
            sessionId: { S: sessionId },
        });
        if (!session) return null;

        const filteredObject = {
            sessionId: session.sessionId.S,
            userId: parseInt(session.userId.N!),
            createdAt: parseInt(session.issuedAt.N!),
            expiresAt: parseInt(session.expiresAt.N!),
        };

        if (filteredObject.expiresAt < Date.now()) {
            await this.deleteSession(sessionId);
            return null;
        }

        return filteredObject;
    }
}
