/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
const SibApiV3Sdk = require('sib-api-v3-sdk');
import { Injectable } from '@nestjs/common';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { SendData } from './models/types/send-data';

@Injectable()
export class SmtpService {
    constructor(private readonly envConfigService: EnvConfigService) {
        const client = SibApiV3Sdk.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = envConfigService.SMTP_API_KEY;
    }

    /**
     * Send emails to different addresses
     * @param data The configuration parameters to send the emails
     */
    public async sendEmails(data: SendData) {
        const { toAddresses, subject, html, text } = data;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const params = {
            sender: {
                name: this.envConfigService.SMTP_NAME,
                email: this.envConfigService.SMTP_EMAIL,
            },
            to: toAddresses.map((email) => ({ email })),
            subject,
            htmlContent: html,
            textContent: text,
        };
        await apiInstance.sendTransacEmail(params);
    }
}
