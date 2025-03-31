import { Injectable } from '@nestjs/common';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { DynamoTables } from 'src/services/aws/dynamo/tables';
import { hashString } from 'src/util/hash';
import { Session } from './models/session';

@Injectable()
export class SessionsService {
    private readonly sessionsTable = DynamoTables.sessions;

    constructor(private readonly dynamoService: DynamoService) {}

    /**
     * Delete a session by its ID
     * @param sessionId The ID of the session
     */
    public async deleteSession(sessionId: string) {
        return await this.dynamoService.deleteOne(this.sessionsTable, {
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
        const dynamoSessionData = {
            sessionId: { S: sessionId },
            userId: { N: userId.toString() },
            issuedAt: { N: now.toString() },
            expiresAt: { N: tenDays.toString() },
        };
        await this.dynamoService.putOne(this.sessionsTable, dynamoSessionData);
        return { sessionId, expiresAt: tenDays };
    }

    /**
     * Finds a session by its ID, if the session is not found or it is expired, delete it and return `null`
     * @param sessionId
     * @returns
     */
    public async findSession(sessionId: string) {
        const output = await this.dynamoService.findOne(this.sessionsTable, {
            sessionId: { S: sessionId },
        });
        if (!output.Item) return null;
        const session = Session.fromDynamoItem(output.Item);

        if (session.expiresAt < Date.now()) {
            await this.deleteSession(sessionId);
            return null;
        }

        return session;
    }
}
