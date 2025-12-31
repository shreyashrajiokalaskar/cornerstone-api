import { IDocumentJob } from "@app/common/interfaces/common.interface";
import AWS from 'aws-sdk';
import { QueueService } from "./sqs.interface";

export class ElasticMqService implements QueueService {
    client: AWS.SQS;;
    private queueUrl: string;

    constructor() {
        const endpoint = process.env['SQS_ENDPOINT'];

        this.client = new AWS.SQS({
            region: 'us-east-1',
            endpoint: endpoint,
            credentials: {
                accessKeyId: 'x',
                secretAccessKey: 'x',
            },
        });


        this.queueUrl = process.env['DOC_QUEUE_URL'] as string;



        console.log('SQS connected to:', this.queueUrl);

    }

    async sendDocumentJob(payload: IDocumentJob) {
        await this.client.sendMessage({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(payload)
        }).promise()

    }
}
