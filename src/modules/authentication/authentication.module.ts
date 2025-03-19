import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { DynamoDbService } from 'src/services/dynamodb.service';
import { EmailService } from 'src/services/email.service';

@Module({
    controllers: [AuthenticationController],
    providers: [AuthenticationService, UserService, PrismaService, DynamoDbService, EmailService],
})
export class AuthenticationModule {}
