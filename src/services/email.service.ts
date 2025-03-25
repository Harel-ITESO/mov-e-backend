import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { EnvConfigService } from './env-config.service';

@Injectable()
export class EmailService {
    private readonly client: SESClient;

    constructor(private envConfigService: EnvConfigService) {
        if (envConfigService.isProdEnv()) {
            const options = {
                region: envConfigService.AWS_REGION,
                credentials: {
                    accessKeyId: envConfigService.AWS_ACCESS_KEY_ID,
                    secretAccessKey: envConfigService.AWS_SECRET_ACCESS_KEY
                },
            };
            this.client = new SESClient(options);
        } else {
            const options = {
                endpoint: envConfigService.LOCAL_AWS_ENDPOINT,
            };
            this.client = new SESClient(options);
        }
    }

    /**
     * Sends an email to the given email address
     * @param to The email receiver
     * @param subject The email subject
     * @param html The HTML version of email body
     * @param text The text version of email body
     * @returns The promise of sending the email
     */
    sendEmail(to: string, subject: string, html: string, text: string) {
        const params: SendEmailCommandInput = {
            Source: this.envConfigService.EMAIL_SENDER,
            Destination: {
                ToAddresses: [to],
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
        };
        return this.client.send(new SendEmailCommand(params));
    }
}
