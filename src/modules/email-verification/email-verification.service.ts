import { Injectable } from '@nestjs/common';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { DynamoTables } from 'src/services/aws/dynamo/tables';
import { SesService } from 'src/services/aws/ses/ses.service';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { hashString } from 'src/util/hash';
import { EmailVerification } from './models/email-verification';
import { EmailVerificationExpiredException } from './models/email-verification-expired.exception';
import { EmailVerificationOptionsFactory } from './email-verification-options-factory';

@Injectable()
export class EmailVerificationService {
    private readonly emailsTable = DynamoTables.pendingEmailValidation;

    constructor(
        private readonly dynamoService: DynamoService,
        private readonly sesService: SesService,
        private readonly envConfigService: EnvConfigService,
    ) {}

    /**
     * Registers a new email on DynamoDB for pending verification and sends the email for verification
     * @param email Email of the user to register
     * @returns The verification id
     */
    public async registerProvidedEmailForVerification(email: string) {
        const verificationId = hashString(
            email + Date.now() + 'email-verification',
            'sha256',
        );
        const now = Date.now();
        const tenMinutes = now + 10 * 60 * 1000; // 10 minutes in milliseconds
        await this.dynamoService.putOne(this.emailsTable, {
            verificationId: { S: verificationId },
            email: { S: email },
            createdAt: { N: now.toString() },
            expiresAt: { N: tenMinutes.toString() },
        });

        // TODO: Change this to use valid hyperlinks
        const emailOptions = EmailVerificationOptionsFactory.getEmailOptions(
            [email],
            `http://frontend.com/${verificationId}`,
        );
        await this.sesService.sendEmail({
            ...emailOptions,
        });
        return { message: 'Email verification pending' };
    }

    /**
     * Deletes a pending verification from DynamoDB Table
     * @param verificationId The id of the verification to delete
     * @returns Deletion assertion
     */
    public async deletePendingVerification(verificationId: string) {
        return await this.dynamoService.deleteOne(this.emailsTable, {
            verificationId: { S: verificationId },
        });
    }

    /**
     * Finds a pending verification and returns it, if not found returns null.
     * If the pending verification expired, throws an error to be handled
     * @param verificationId The id of the verification to find
     * @returns The verification if found, null if not found
     * @throws Error if it expired, indicating the required information
     */
    public async findPendingVerification(verificationId: string) {
        const output = await this.dynamoService.findOne(this.emailsTable, {
            verificationId: { S: verificationId },
        });

        if (!output.Item) return null;
        const emailVerification = EmailVerification.fromDynamoItem(output.Item);
        await this.deletePendingVerification(verificationId); // Delete the record
        if (emailVerification.expiresAt < Date.now()) {
            throw new EmailVerificationExpiredException('Verification expired');
        }
        return emailVerification;
    }
}
