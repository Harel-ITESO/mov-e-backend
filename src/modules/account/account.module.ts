import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [UserModule, FilesModule],
    controllers: [AccountController],
    providers: [AccountService, EnvConfigService],
    exports: [AccountService],
})
export class AccountModule {}
