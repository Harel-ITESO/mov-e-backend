import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand, SendEmailCommandInput, SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_SES_EMAIL_SENDER } from 'src/util/globals';

@Injectable()
export class EmailService {
    private readonly sesClient: SESClient;

    constructor() {
        this.sesClient = new SESClient({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            }
        });
    }

    sendEmail(to: string, subject: string, body: string): Promise<SendEmailCommandOutput> {
        const params: SendEmailCommandInput = {
            Source: AWS_SES_EMAIL_SENDER,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Text: {
                        Data: body,
                    }
                }
            }
        };
        return this.sesClient.send(new SendEmailCommand(params));
    }
}
