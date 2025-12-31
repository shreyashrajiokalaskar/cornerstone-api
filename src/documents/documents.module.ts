import { S3Service } from '@app/common';
import { QueueModule } from '@app/common/services/aws/queue/queue.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentChunkEntity } from './entities/document-chunk.entity';
import { DocumentEntity } from './entities/document.entity';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    S3Service,
  ],
  imports: [TypeOrmModule.forFeature([DocumentEntity, DocumentChunkEntity]), QueueModule],
})
export class DocumentsModule { }
