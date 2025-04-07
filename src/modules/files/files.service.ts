import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/services/aws/s3/s3.service';
import { EnvConfigService } from 'src/services/env/env-config.service';

@Injectable()
export class FilesService {
    private readonly bucketName: string;

    constructor(
        private readonly s3Service: S3Service,
        private readonly envConfigService: EnvConfigService,
    ) {
        this.bucketName = envConfigService.BUCKET_NAME;
    }

    /**
     * Uploads a file to S3 and gives back the endpoint
     * @param file The file to upload
     * @param fileName The name of the file which will be uploaded
     * @returns The endpoint of the file on S3 bucket
     */
    public async uploadFile(file: Express.Multer.File, fileName: string) {
        await this.s3Service.putFile(this.bucketName, fileName, file.buffer);
        if (this.envConfigService.isDevEnv()) {
            const endpoint = this.envConfigService.LOCAL_AWS_ENDPOINT.replace(
                'localstack',
                'localhost',
            );
            return `${endpoint}/${this.bucketName}/${fileName}`;
        }
        return `https://${this.bucketName}.s3.${this.envConfigService.AWS_REGION}.amazonaws.com/${fileName}`;
    }
}
