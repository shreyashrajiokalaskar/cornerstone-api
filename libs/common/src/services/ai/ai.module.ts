import { Module } from "@nestjs/common";
import { EmbeddingService } from "./embeddings.service";
import { RagService } from "./rag.service";
import { VectorService } from "./vector.service";

@Module({
    providers: [EmbeddingService, RagService, VectorService],
    exports: [EmbeddingService, RagService, VectorService]
})
export class AiModule { }
