import { SqsService } from "@app/common";
import { ElasticMqService } from "./elastic-mq.service";
import { QueueService } from "./sqs.interface";

export function createQueueService(): QueueService {
    if (process.env['NODE_ENV'] === 'development') {
        return new ElasticMqService();
    }
    return new SqsService();
}
