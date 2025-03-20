import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { DynamoService } from 'src/services/aws/dynamo/dynamo.service';

@Global()
@Module({
    providers: [SessionService, DynamoService],
    exports: [SessionService],
})
export class SessionModule {}
