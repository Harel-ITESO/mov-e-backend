import { Global, Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';
import { EnvConfigService } from 'src/services/env/env-config.service';

@Global()
@Module({
    providers: [SessionsService, DynamoService, EnvConfigService],
    exports: [SessionsService],
})
export class SessionsModule {}
