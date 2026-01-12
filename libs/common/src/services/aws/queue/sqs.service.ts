import {
  IChatExportJob,
  IDocumentJob,
} from '@app/common/interfaces/common.interface';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { QueueService } from './sqs.interface';

export class SqsService implements QueueService {
  client: SQSClient;
  private queueUrl: string;

  constructor() {
    this.client = new SQSClient({
      region: process.env['AWS_REGION'] as string,
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'] as string,
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] as string,
      },
    });

    this.queueUrl = process.env['DOC_QUEUE_URL'] as string;

    console.log('SQS connected to:', this.queueUrl);
  }

  async sendDocumentJob(payload: IDocumentJob): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
      }),
    );
  }

  async sendChatExportJob(chatDetails: IChatExportJob): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: process.env['CHAT_EXPORT_QUEUE_URL'] as string,
        MessageBody: JSON.stringify(chatDetails),
      }),
    );
  }
}
