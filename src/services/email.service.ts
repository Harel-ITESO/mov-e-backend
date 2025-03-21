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

<<<<<<< HEAD
    sendEmail(to: string, subject: string, html: string, text: string): Promise<SendEmailCommandOutput> {
        const params: SendEmailCommandInput = {
            Source: this.envConfigService.EMAIL_SENDER,
=======
    sendEmail(to: string, subject: string, body: string): Promise<SendEmailCommandOutput> {
        const params: SendEmailCommandInput = {
            Source: AWS_SES_EMAIL_SENDER,
>>>>>>> 0abafb2072e58d5657007950e927b2f6494c207f
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
<<<<<<< HEAD
                    Html: {
                        Data: html,
                    },
                    Text: {
                        Data: text,
                    },
                },
            },
=======
                    Text: {
                        Data: body,
                    }
                }
            }
>>>>>>> 0abafb2072e58d5657007950e927b2f6494c207f
        };
        return this.sesClient.send(new SendEmailCommand(params));
    }
}
