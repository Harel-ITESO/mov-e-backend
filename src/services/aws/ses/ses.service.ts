/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { Injectable } from '@nestjs/common';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { SendData } from './models/types/send-data';

@Injectable()
export class SesService {
    constructor(private readonly envConfigService: EnvConfigService) {
        const client = SibApiV3Sdk.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = envConfigService.SMTP_API_KEY;
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
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const params = {
            sender: {
                name: this.envConfigService.SMTP_NAME,
                email: this.envConfigService.SMTP_EMAIL,
            },
            to: [{ email: toAddresses }],
            subject,
            htmlContent: html,
            textContent: text,
        };
        await apiInstance.sendTransacEmail(params);
    }
}
