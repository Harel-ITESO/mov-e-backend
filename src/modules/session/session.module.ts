import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { EnvConfigService } from 'src/services/env-config.service';

@Global()
@Module({
    providers: [SessionService, DynamoService, EnvConfigService],
    exports: [SessionService],
})
export class SessionModule {}
