import { IDocumentJob } from "@app/common/interfaces/common.interface";

export interface QueueService {
    sendDocumentJob(payload: IDocumentJob): Promise<void>;
}
