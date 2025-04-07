import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { SendData } from './models/types/send-data';

@Injectable()
export class SesService {
    private readonly client: SESClient;

    constructor(private readonly envConfigService: EnvConfigService) {
        this.client = new SESClient({
            region: envConfigService.AWS_REGION,
            endpoint: envConfigService.isDevEnv()
                ? envConfigService.LOCAL_AWS_ENDPOINT
                : undefined,
        });
    }

    /**
     * Sends an email to the given email address
     * @param to The email receiver
     * @param subject The email subject
     * @param html The HTML version of email body
     * @param text The text version of email body
     * @returns The promise of sending the email
     */
    public async sendEmail(data: SendData) {
        const { toAddresses, subject, html, text } = data;
        return await this.client.send(
            new SendEmailCommand({
                Source: this.envConfigService.EMAIL_SENDER,
                Destination: {
                    ToAddresses: [...toAddresses],
                },
                Message: {
                    Subject: {
                        Data: subject,
                    },

                    Body: {
                        Html: {
                            Data: html,
                        },
                        Text: {
                            Data: text,
                        },
                    },
                },
            }),
        );
    }
}
