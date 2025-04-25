import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { FollowsModule } from '../follows/follows.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [FollowsModule, UserModule],
    controllers: [ProfilesController],
    providers: [ProfilesService],
})
export class ProfilesModule {}
