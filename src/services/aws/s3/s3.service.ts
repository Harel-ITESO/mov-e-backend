import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { EnvConfigService } from 'src/services/env/env-config.service';

@Injectable()
export class S3Service {
    private readonly client: S3Client;

    constructor(private readonly envConfigService: EnvConfigService) {
        this.client = new S3Client({
            region: envConfigService.AWS_REGION,
            endpoint: envConfigService.isDevEnv()
                ? envConfigService.LOCAL_AWS_ENDPOINT
                : undefined,
            forcePathStyle: envConfigService.isDevEnv() ? true : undefined,
        });
    }

    /**
     * Puts a file into an S3 Bucket
     * @param bucket The destination bucket
     * @param key The name of the file
     * @param buffer The buffer data
     * @returns The response of the command
     */
    public async putFile(bucket: string, key: string, buffer: Buffer) {
        const response = await this.client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ACL: 'public-read',
            }),
        );
        return response;
    }

    /**
     * Deletes a file from a bucket
     * @param bucket The bucket to delete from
     * @param key The file name
     * @returns The response of the command
     */
    public async deleteFile(bucket: string, key: string) {
        const response = await this.client.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            }),
        );
        return response;
    }
}
