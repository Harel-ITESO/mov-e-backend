import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand, SendEmailCommandInput, SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { EnvConfigService } from './env-config.service';

@Injectable()
export class EmailService {
    private readonly sesClient: SESClient;

    constructor(private envConfigService: EnvConfigService) {
        this.sesClient = new SESClient({
            region: envConfigService.AWS_REGION,
            credentials: {
                accessKeyId: envConfigService.AWS_ACCESS_KEY_ID,
                secretAccessKey: envConfigService.AWS_SECRET_ACCESS_KEY,
            }
        });
    }

    sendEmail(to: string, subject: string, html: string, text: string): Promise<SendEmailCommandOutput> {
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
        return this.sesClient.send(new SendEmailCommand(params));
    }
}
