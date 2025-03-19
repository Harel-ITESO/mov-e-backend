import { Injectable, NotFoundException } from '@nestjs/common';
import { AttributeValue, DeleteItemCommand, DeleteItemCommandInput, DeleteItemCommandOutput, DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from 'src/util/globals';

export enum DYNAMODB_TABLES {
    OTP = 'one-time-password'
}

@Injectable()
export class DynamoDbService {
    private readonly dynamoDbClient: DynamoDBClient;

    constructor() {
        this.dynamoDbClient = new DynamoDBClient({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        });
    }

    findOne(TableName: DYNAMODB_TABLES, Key: Record<string, AttributeValue>): Promise<GetItemCommandOutput> {
        const params: GetItemCommandInput = {
            TableName,
            Key
        };
        return this.dynamoDbClient.send(new GetItemCommand(params));
    }

    async findOneOrThrow(TableName: DYNAMODB_TABLES, Key: Record<string, AttributeValue>, errorMessage: string): Promise<GetItemCommandOutput> {
        const register = await this.findOne(TableName, Key);
        if (!register) {
            throw new NotFoundException(errorMessage);
        }
        return register;
    }

    putOne(TableName: DYNAMODB_TABLES, Item: Record<string, AttributeValue>): Promise<PutItemCommandOutput> {
        const params: PutItemCommandInput = {
            TableName,
            Item
        };
        return this.dynamoDbClient.send(new PutItemCommand(params));
    }

    deleteOne(TableName: DYNAMODB_TABLES, Key: Record<string, AttributeValue>): Promise<DeleteItemCommandOutput> {
        const params: DeleteItemCommandInput = {
            TableName,
            Key
        };
        return this.dynamoDbClient.send(new DeleteItemCommand(params));
    }
}
