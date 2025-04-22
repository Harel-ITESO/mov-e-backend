import {
    AttributeValue,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { DynamoTables } from './tables';

type ItemKey = Record<string, AttributeValue>;

@Injectable()
export class DynamoService {
    private readonly client: DynamoDBClient;

    constructor(private envConfigService: EnvConfigService) {
        this.client = new DynamoDBClient({
            region: envConfigService.AWS_REGION,
            endpoint: envConfigService.isDevEnv()
                ? envConfigService.LOCAL_AWS_ENDPOINT
                : undefined,
        });
    }

    /**
     * Retrieves an item from a table
     * @param tableName The table name
     * @param key The key of the item
     * @returns Response from the operation
     */
    findOne(tableName: DynamoTables, key: ItemKey) {
        const params = { TableName: tableName, Key: key };
        return this.client.send(new GetItemCommand(params));
    }

    /**
     * Retrieves an item from a table, if not found, throws a NotFoundException
     * @param tableName The table name
     * @param key The key of the item
     * @param errorMessage The message to send in NotFoundException
     * @returns Response from the operation
     */
    async findOneOrThrow(
        tableName: DynamoTables,
        key: ItemKey,
        errorMessage: string,
    ) {
        const register = await this.findOne(tableName, key);
        if (!register.Item) {
            throw new NotFoundException(errorMessage);
        }
        return register;
    }

    /**
     * Lists all items from a table
     * @param tableName The table name
     * @returns Response from the operation
     */
    findAll(tableName: DynamoTables) {
        const params = { TableName: tableName };
        return this.client.send(new ScanCommand(params));
    }

    /**
     * Puts an item on a table
     * @param tableName The table name
     * @param item The item to put on database
     * @returns Response from the operation
     */
    putOne(tableName: DynamoTables, item: ItemKey) {
        const params = { TableName: tableName, Item: item };
        return this.client.send(new PutItemCommand(params));
    }

    /**
     * Deletes an item from a table
     * @param tableName The name of the table
     * @param key The key of the item
     * @returns Response from the operation
     */
    deleteOne(tableName: DynamoTables, key: ItemKey) {
        const params = { TableName: tableName, Key: key };
        return this.client.send(new DeleteItemCommand(params));
    }
}
