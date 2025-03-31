import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { SesService } from 'src/services/aws/ses/ses.service';

@Module({
    providers: [
        EmailVerificationService,
        DynamoService,
        EnvConfigService,
        SesService,
    ],
    exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
