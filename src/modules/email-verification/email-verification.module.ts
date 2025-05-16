import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { SmtpService } from 'src/services/smtp/smtp.service';

@Module({
    providers: [
        EmailVerificationService,
        DynamoService,
        EnvConfigService,
        SmtpService,
    ],
    exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
