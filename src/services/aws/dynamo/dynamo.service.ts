import {
    AttributeValue,
    DeleteItemCommand,
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ItemKey = Record<string, AttributeValue>;

@Injectable()
export class DynamoService {
    private readonly client: DynamoDBClient;

    constructor(private readonly configService: ConfigService) {
        const enviroment = this.configService.getOrThrow<string>('NODE_ENV');
        if (enviroment === 'development') {
            const options = {
                region: 'local',
                endpoint: this.configService.getOrThrow<string>(
                    'DEV_DYNAMO_ENDPOINT',
                ),
            };
            this.client = new DynamoDBClient(options);
        } else {
            this.client = new DynamoDBClient({ region: 'us-east-1' });
        }
    }

    /**
     * Lists all items from a table
     * @param tableName
     * @returns
     */
    public async listItemsFromTable(tableName: string) {
        return await this.client.send(
            new ScanCommand({ TableName: tableName }),
        );
    }

    /**
     * Creates an item on a table
     * @param tableName
     * @param item
     * @returns
     */
    public async createItemOnTable(tableName: string, item: ItemKey) {
        const created = await this.client.send(
            new PutItemCommand({ TableName: tableName, Item: item }),
        );
        return created;
    }

    /**
     * Retrieves an item from a table
     * @param tableName The table name
     * @param key The key of the item
     * @returns The item if found or `null`
     */
    public async getItemFromTable(tableName: string, key: ItemKey) {
        const item = await this.client.send(
            new GetItemCommand({ TableName: tableName, Key: key }),
        );
        return item.Item;
    }

    /**
     * Deletes an Item from a table
     * @param tableName The name of the table
     * @param key The key of the item
     * @returns Response from the operation
     */
    public async deleteItemFromTable(tableName: string, key: ItemKey) {
        const item = await this.client.send(
            new DeleteItemCommand({ TableName: tableName, Key: key }),
        );
        return item;
    }
}
