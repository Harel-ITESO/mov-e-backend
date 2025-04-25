import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { UserModule } from '../user/user.module';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
    imports: [UserModule],
    controllers: [FollowsController],
    providers: [FollowsService, PrismaService],
    exports: [FollowsService],
})
export class FollowsModule {}
