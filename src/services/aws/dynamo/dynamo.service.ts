import {
    AttributeValue,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EnvConfigService } from 'src/services/env-config.service';

export enum DYNAMO_TABLES {
    OTP = 'one-time-password',
    SESSIONS = 'sessions'
}

type ItemKey = Record<string, AttributeValue>;

@Injectable()
export class DynamoService {
    private readonly client: DynamoDBClient;

    constructor(private envConfigService: EnvConfigService) {
        if (envConfigService.isProdEnv()) {
            const options = {
                region: envConfigService.AWS_REGION,
                credentials: {
                    accessKeyId: envConfigService.AWS_ACCESS_KEY_ID,
                    secretAccessKey: envConfigService.AWS_SECRET_ACCESS_KEY
                },
            };
            this.client = new DynamoDBClient(options);
        } else {
            const options = {
                endpoint: envConfigService.LOCAL_AWS_ENDPOINT,
            };
            this.client = new DynamoDBClient(options);
        }
    }

    /**
     * Retrieves an item from a table
     * @param TableName The table name
     * @param Key The key of the item
     * @returns Response from the operation
     */
    findOne(TableName: DYNAMO_TABLES, Key: ItemKey) {
        const params = { TableName, Key };
        return this.client.send(new GetItemCommand(params));
    }

    /**
     * Retrieves an item from a table, if not found, throws a NotFoundException
     * @param TableName The table name
     * @param Key The key of the item
     * @param errorMessage The message to send in NotFoundException
     * @returns Response from the operation
     */
    async findOneOrThrow(TableName: DYNAMO_TABLES, Key: ItemKey, errorMessage: string) {
        const register = await this.findOne(TableName, Key);
        if (!register.Item) {
            throw new NotFoundException(errorMessage);
        }
        return register;
    }

    /**
     * Lists all items from a table
     * @param TableName The table name
     * @returns Response from the operation
     */
    findAll(TableName: DYNAMO_TABLES) {
        const params = { TableName };
        return this.client.send(new ScanCommand(params));
    }

    /**
     * Puts an item on a table
     * @param TableName The table name
     * @param Item The item to put on database
     * @returns Response from the operation
     */
    putOne(TableName: DYNAMO_TABLES, Item: ItemKey) {
        const params = { TableName, Item };
        return this.client.send(new PutItemCommand(params));
    }

    /**
     * Deletes an item from a table
     * @param TableName The name of the table
     * @param Key The key of the item
     * @returns Response from the operation
     */
    deleteOne(TableName: DYNAMO_TABLES, Key: ItemKey) {
        const params = { TableName, Key };
        return this.client.send(new DeleteItemCommand(params));
    }
}
