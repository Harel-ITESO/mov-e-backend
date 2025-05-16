import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { S3Service } from 'src/services/aws/s3/s3.service';
import { EnvConfigService } from 'src/services/env/env-config.service';

@Module({
    providers: [FilesService, S3Service, EnvConfigService],
    exports: [FilesService],
})
export class FilesModule {}
