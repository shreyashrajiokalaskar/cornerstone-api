import { Module } from "@nestjs/common";
import { createQueueService } from "./sqs.factory";

@Module({
    providers: [
        {
            provide: 'QUEUE_SERVICE',
            useFactory: createQueueService
        }
    ],
    exports: ['QUEUE_SERVICE'],
})
export class QueueModule { }
