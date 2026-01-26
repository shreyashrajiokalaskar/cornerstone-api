import {
  IChatExportJob,
  IDocumentJob,
} from '@app/common/interfaces/common.interface';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { QueueService } from './sqs.interface';
import { Logger } from '@nestjs/common';

export class SqsService implements QueueService {
  client: SQSClient;
  private queueUrl: string;
  private readonly logger = new Logger(SqsService.name);

  constructor() {
    this.client = new SQSClient({
      region: process.env['AWS_REGION'] as string,
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'] as string,
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] as string,
      },
    });

    this.queueUrl = process.env['DOC_QUEUE_URL'] as string;

    this.logger.log('SQS connected to', this.queueUrl);
  }

  async sendDocumentJob(payload: IDocumentJob): Promise<void> {
    this.logger.debug('sendDocumentJob', { queueUrl: this.queueUrl, payload });
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
      }),
    );
  }

  async sendChatExportJob(chatDetails: IChatExportJob): Promise<void> {
    this.logger.debug('sendChatExportJob', { payload: chatDetails });
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: process.env['CHAT_EXPORT_QUEUE_URL'] as string,
        MessageBody: JSON.stringify(chatDetails),
      }),
    );
  }
}
